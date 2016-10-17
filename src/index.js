"use strict";
const gulp = require('gulp');
const through = require('through2');
const ph = require('path');
const fs = require('fs');
const md5 = require('md5');
let json;
try {
    json = require(process.cwd() + '/dependent.json');
}
catch (error) {
    json = [];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new class AxibaDependent {
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
        this.dependentList = json;
    }
    /**
    * 根据glob路径 扫描依赖
    * @param glob
    */
    src(glob) {
        return new Promise((resolve, reject) => {
            gulp.src(glob)
                .pipe(this.getReadWriteStream())
                .on('finish', () => {
                resolve(this.dependentList);
            });
        });
    }
    /**
     * 生成依赖json文件
     * @param  {string='./dependent.json'} path
     * @returns Promise
     */
    createJsonFile(path = process.cwd() + '/dependent.json') {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(this.dependentList), 'utf8', () => {
                console.log('依赖json文件生成成功！');
                resolve();
            });
        });
    }
    /**
     * 添加到临时依赖列表
     */
    getReadWriteStream() {
        return through.obj((file, enc, callback) => {
            let dependentType = this.getDependent(file);
            if (!dependentType) {
                return callback();
            }
            let dep = this.dependentList.find(value => {
                return value.path == this.clearPath(file.path);
            });
            if (dep) {
                dep.dep = dependentType.dep;
            }
            else {
                this.dependentList.push(dependentType);
            }
            callback();
        });
    }
    /**
     * 根据路劲获取依赖数组
     * @param  {string} path 路劲
     * @param  {boolean} bl 是否是首个路劲
     * @returns string[]
     */
    getDependentArr(path, bl = true) {
        bl && (this.recordGetDependentPath = []);
        // 如果已经查找过 跳出
        if (this.recordGetDependentPath.find(value => value == path)) {
            return [];
        }
        this.recordGetDependentPath.push(path);
        path = this.clearPath(path);
        let depArr = [];
        let depObject = this.dependentList.find(value => value.path == path);
        if (depObject) {
            depArr = depArr.concat(depObject.dep);
            for (let key in depObject.dep) {
                let element = depObject.dep[key];
                depArr = depArr.concat(this.getDependentArr(element, false));
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
    getDependent(file) {
        file.extname = ph.extname(file.path);
        let dependentConfig = this.confing.find(value => {
            let extnameAlias = value.extnameAlias && value.extnameAlias.find(value => value == file.extname);
            return value.extname == file.extname || !!extnameAlias;
        });
        if (!dependentConfig)
            return;
        let content = file.contents.toString();
        let depArr = [];
        dependentConfig.parserRegExpList.forEach(value => {
            let match = value.match.split('$').filter(value => !!value).map(value => Number(value));
            let path = this.match(content, value.regExp, match);
            depArr = depArr.concat(path);
        });
        depArr = depArr.map(value => {
            value = this.clearPath(value);
            //join路径            
            if (value.indexOf('/') != -1 || !dependentConfig.haveAlias) {
                value = this.clearPath(ph.join(ph.dirname(file.path), value));
                //补后缀
                if (dependentConfig.completionExtname) {
                    value = ph.extname(value) && !!this.confing.find(val => val.extname === ph.extname(value)) ? value : value + dependentConfig.extname;
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
        let dependentConfig = this.confing.find(value => value.extname == extname);
        if (dependentConfig) {
            dependentConfig.parserRegExpList.push({
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
        let dependentConfig = this.confing.find(value => value.extname == extname);
        if (dependentConfig) {
            dependentConfig.extnameAlias = dependentConfig.extnameAlias || [];
            dependentConfig.extnameAlias.push(alias);
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
