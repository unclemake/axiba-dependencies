"use strict";
const gulp = require('gulp');
const through = require('through2');
const ph = require('path');
const fs = require('fs');
const md5 = require('md5');
let json;
try {
    json = require(process.cwd() + '/dependencies.json');
}
catch (error) {
    json = [];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new class AxibaDependencies {
    constructor() {
        /**
        * 配置
        */
        this.confing = [
            {
                extname: '.less',
                parserRegExpList: [{
                        regExp: /@import +["'](.+?)['"]/g,
                        match: '$1'
                    }],
                completionExtname: true
            },
            {
                extname: '.js',
                parserRegExpList: [{
                        regExp: /require\(["'](.+?)['"]/g,
                        match: '$1'
                    }],
                extnameAlias: [],
                completionExtname: true,
                haveAlias: true
            }
        ];
        /**
        * 临时依赖列表
        */
        this.dependenciesList = json;
    }
    /**
    * 根据glob路径 扫描依赖
    * @param glob
    */
    src(glob) {
        return new Promise((resolve, reject) => {
            gulp.src(glob)
                .pipe(this.readWriteStream())
                .on('finish', () => {
                resolve(this.dependenciesList);
            });
        });
    }
    /**
     * 生成依赖json文件
     * @param  {string='./dependencies.json'} path
     * @returns Promise
     */
    createJsonFile(path = process.cwd() + '/dependencies.json') {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(this.dependenciesList), 'utf8', () => {
                console.log('依赖json文件生成成功！');
                resolve();
            });
        });
    }
    /**
     * 数据流 分析
     */
    readWriteStream() {
        return through.obj((file, enc, callback) => {
            let dependenciesModel = this.getDependencies(file);
            // 没有此文件后缀的匹配会跳出
            if (!dependenciesModel) {
                return callback();
            }
            let depObjectOld = this.dependenciesList.find(value => {
                return value.path == this.clearPath(file.path);
            });
            if (depObjectOld) {
                depObjectOld.dep.forEach(value => this.delBeDep(value, dependenciesModel.path));
                depObjectOld.dep = dependenciesModel.dep;
                depObjectOld.md5 = dependenciesModel.md5;
            }
            else {
                this.dependenciesList.push(dependenciesModel);
            }
            dependenciesModel.dep.forEach(value => this.addBeDep(value, dependenciesModel.path));
            callback();
        });
    }
    delBeDep(path, beDep) {
        let depObject = this.dependenciesList.find(value => value.path == path);
        if (depObject) {
            depObject.beDep = depObject.beDep.filter(value => value !== beDep);
        }
    }
    addBeDep(path, beDep) {
        let depObject = this.dependenciesList.find(value => value.path == path);
        if (depObject) {
            depObject.beDep.find(value => value == beDep) || depObject.beDep.push(beDep);
        }
        else {
            this.dependenciesList.push({
                path: path,
                beDep: [beDep],
                dep: [],
                md5: ''
            });
        }
    }
    /**
     * 根据路劲获取依赖数组
     * @param  {string} path 路劲
     * @param  {boolean} bl 是否是首个路劲
     * @returns string[]
     */
    getDependenciesArr(path, bl = true) {
        bl && (this.recordGetDependenciesPath = []);
        // 如果已经查找过 跳出
        if (this.recordGetDependenciesPath.find(value => value == path)) {
            return [];
        }
        this.recordGetDependenciesPath.push(path);
        path = this.clearPath(path);
        let depArr = [];
        let depObject = this.dependenciesList.find(value => value.path == path);
        if (depObject) {
            depArr = depArr.concat(depObject.dep);
            for (let key in depObject.dep) {
                let element = depObject.dep[key];
                depArr = depArr.concat(this.getDependenciesArr(element, false));
            }
        }
        if (bl) {
            return [...new Set(depArr)];
        }
        return depArr;
    }
    /**
     * 根据文件流获取依赖
     * @param stream nodejs文件流
     */
    getDependencies(file) {
        file.extname = ph.extname(file.path);
        let dependenciesConfig = this.confing.find(value => {
            let extnameAlias = value.extnameAlias && value.extnameAlias.find(value => value == file.extname);
            return value.extname == file.extname || !!extnameAlias;
        });
        if (!dependenciesConfig)
            return;
        let content = file.contents.toString();
        let depArr = [];
        dependenciesConfig.parserRegExpList.forEach(value => {
            let match = value.match.split('$').filter(value => !!value).map(value => Number(value));
            let path = this.match(content, value.regExp, match);
            depArr = depArr.concat(path);
        });
        depArr = depArr.map(value => {
            value = this.clearPath(value);
            //join路径            
            if (value.indexOf('/') != -1 || !dependenciesConfig.haveAlias) {
                value = this.clearPath(ph.join(ph.dirname(file.path), value));
                //补后缀
                if (dependenciesConfig.completionExtname) {
                    value = ph.extname(value) && !!this.confing.find(val => val.extname === ph.extname(value)) ? value : value + dependenciesConfig.extname;
                }
            }
            return value;
        });
        return {
            path: this.clearPath(file.path),
            dep: [...new Set(depArr)],
            beDep: [],
            md5: md5(content)
        };
    }
    /**
     * 获取匹配字段
     * @param content 匹配字符串
     * @param regExp 正则
     * @param match  获取第几个$1
     */
    match(content, regExp, match) {
        let strArr = [];
        content.replace(regExp, function ($1, $2, $3, $4, $5) {
            let str = '';
            let args = arguments;
            match.forEach(value => {
                str += args[value];
            });
            str && strArr.push(str);
        });
        return strArr;
    }
    /**
     * 添加依赖解析正则
     * @param extname 后缀
     * @param regExp 正则
     * @param match 匹配 $1$2
     */
    addParserRegExp(extname, regExp, match) {
        let dependenciesConfig = this.confing.find(value => value.extname == extname);
        if (dependenciesConfig) {
            dependenciesConfig.parserRegExpList.push({
                regExp: regExp,
                match: match
            });
        }
        else {
            this.confing.push({
                extname: extname,
                parserRegExpList: [{
                        regExp: regExp,
                        match: match
                    }],
                extnameAlias: []
            });
        }
    }
    /**
     * 添加别名
     * @param extname 后缀
     * @param alias 别名
     */
    addAlias(extname, alias) {
        let dependenciesConfig = this.confing.find(value => value.extname == extname);
        if (dependenciesConfig) {
            dependenciesConfig.extnameAlias = dependenciesConfig.extnameAlias || [];
            dependenciesConfig.extnameAlias.push(alias);
        }
        else {
            this.confing.push({
                extname: extname,
                parserRegExpList: [],
                extnameAlias: [alias]
            });
        }
    }
    /**
     * 清理路劲
     * @param path
     */
    clearPath(path) {
        if (path.indexOf(process.cwd()) == 0) {
            path = path.replace(process.cwd() + '\\', '');
        }
        path = path.replace(/\\/g, '/')
            .replace(/\/\//g, '/')
            .replace(/([^\.])\.\//g, '$1/');
        return this.clearPathParameter(path);
    }
    /**
    * 清理路径参数
    * @param  path 路径名称
    */
    clearPathParameter(path) {
        return path.replace(/\?.+/g, '').replace(/#.+/g, '');
    }
}
;

//# sourceMappingURL=index.js.map
