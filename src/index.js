"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
/**
 * 依赖
 */
class AxibaDependencies {
    constructor() {
        /**
        * 配置
        */
        this.config = [
            {
                extname: '.less',
                parserRegExpList: [{
                        regExp: /@import +['"](.+?)['"]/g,
                        match: '$1'
                    }, {
                        regExp: /@import +url\(['"](.+?)['"]/g,
                        match: '$1'
                    }],
            },
            {
                extname: '.ts',
                parserRegExpList: [{
                        regExp: /require\(["'](.+?)['"]/g,
                        match: '$1'
                    }, {
                        regExp: /import .+ from +["'](.+?)["']/g,
                        match: '$1'
                    }, {
                        regExp: /import +["'](.+?)["']/g,
                        match: '$1'
                    }],
                haveAlias: true
            },
            {
                extname: '.tsx',
                parserRegExpList: [{
                        regExp: /import .+ from +["'](.+?)["']/g,
                        match: '$1'
                    }, {
                        regExp: /import +["'](.+?)["']/g,
                        match: '$1'
                    }, {
                        regExp: /require\(["'](.+?)['"]/g,
                        match: '$1'
                    }],
                haveAlias: true
            },
            {
                extname: '.js',
                parserRegExpList: [{
                        regExp: /require\(["'](.+?)['"]/g,
                        match: '$1'
                    }],
                extnameAlias: [],
                haveAlias: true
            },
            {
                extname: '.css',
                parserRegExpList: [{
                        regExp: /@import url\(['"](.+?)['"]/g,
                        match: '$1'
                    }],
                extnameAlias: []
            },
            {
                extname: '.html',
                parserRegExpList: [{
                        regExp: /src=['"](.+?)['"]/g,
                        match: '$1'
                    }, {
                        regExp: /href=['"](.+?)['"]/g,
                        match: '$1'
                    }, {
                        regExp: /seajs.use\(['"](.+?)['"]/g,
                        match: '$1'
                    }],
                extnameAlias: []
            }
        ];
        this.extNameList = ['.less', '.js', '.css', '.ts', '.tsx'];
        /**
        * 临时依赖列表
        */
        this.dependenciesArray = json;
    }
    /**
     * 判断是否是别名路径
     * @param  {string} path
     */
    isAlias(path) {
        let extname = ph.extname(path);
        return !!path.match(/^[^\/\.]/g) && this.extNameList.indexOf(extname) === -1;
    }
    /**
    * 根据glob路径 扫描依赖
    * @param glob
    */
    src(glob) {
        return new Promise((resolve, reject) => {
            gulp.src(glob, {
                base: './'
            })
                .pipe(this.readWriteStream())
                .on('finish', () => {
                resolve(this.dependenciesArray);
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
            fs.writeFile(path, JSON.stringify(this.dependenciesArray), 'utf8', () => {
                resolve();
            });
        });
    }
    /**
     * 数据流 分析
     */
    readWriteStream(isCb = false) {
        return through.obj((file, enc, callback) => __awaiter(this, void 0, void 0, function* () {
            if (!file.contents) {
                callback();
            }
            let dependenciesModel = this.getDependencies(file);
            if (!dependenciesModel) {
                return isCb ? callback(null, file) : callback();
            }
            if (this.delByPath(dependenciesModel.path)) {
                this.dependenciesArray.push(dependenciesModel);
            }
            else {
                let obj = yield this.getDependenciesByPath(dependenciesModel.path);
                obj.dep = dependenciesModel.dep;
                obj.md5 = dependenciesModel.md5;
            }
            dependenciesModel.dep.forEach(value => {
                this.addBeDep(value, dependenciesModel.path);
            });
            return isCb ? callback(null, file) : callback();
        }));
    }
    /**
     * 根据path删除依赖
     * @param  {string} path
     */
    delByPath(path) {
        let depObjectOld = this.dependenciesArray.find(value => value.path === this.clearPath(path));
        if (depObjectOld) {
            depObjectOld.dep.forEach(value => this.delBeDep(value, path));
            if (depObjectOld.beDep.length === 0) {
                this.dependenciesArray.splice(this.dependenciesArray.findIndex(value => value === depObjectOld), 1);
                return true;
            }
            return false;
        }
        return true;
    }
    /**
     * 删除 path 的beDep 被依赖
     * @param  {string} path
     * @param  {string} beDep
     */
    delBeDep(path, beDep) {
        let depObject = this.dependenciesArray.find(value => value.path === path);
        if (depObject) {
            depObject.beDep = depObject.beDep.filter(value => value !== beDep);
        }
    }
    /**
    * 添加 path 的beDep 被依赖
    * @param  {string} path
    * @param  {string} beDep
    */
    addBeDep(path, beDep) {
        let depObject = this.dependenciesArray.find(value => value.path === path);
        if (depObject) {
            depObject.beDep.find(value => value == beDep) || depObject.beDep.push(beDep);
        }
        else {
            this.dependenciesArray.push({
                path: path,
                beDep: [beDep],
                dep: [],
                md5: '',
                extend: {}
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
        let depObject = this.dependenciesArray.find(value => value.path == path);
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
     * 根据路劲获取被依赖数组 所有文件
     * @param  {string} path 路劲
     * @param  {boolean} bl 是否是首个路劲
     * @returns string[]
     */
    getBeDependenciesArr(path, bl = true) {
        return __awaiter(this, void 0, Promise, function* () {
            bl && (this.recordGetBeDependenciesPath = []);
            // 如果已经查找过 跳出
            if (this.recordGetBeDependenciesPath.find(value => value == path)) {
                return [];
            }
            this.recordGetBeDependenciesPath.push(path);
            path = this.clearPath(path);
            let depArr = [];
            let depObject = yield this.getDependenciesByPath(path);
            if (depObject) {
                depArr = depArr.concat(depObject.beDep);
                for (let key in depObject.beDep) {
                    let element = depObject.beDep[key];
                    depArr = depArr.concat(this.getBeDependenciesArr(element, false));
                }
            }
            if (bl) {
                return [...new Set(depArr)];
            }
            return depArr;
        });
    }
    /**
     * 根据path获取依赖
     * @param path
     */
    getDependenciesByPath(path) {
        return __awaiter(this, void 0, Promise, function* () {
            path = this.clearPath(path);
            let depArr = this.dependenciesArray.find(value => value.path === path);
            if (depArr) {
                return depArr;
            }
            else {
                yield this.src(path);
                return this.dependenciesArray.find(value => value.path === path);
            }
        });
    }
    /**
     * 根据文件流获取依赖对象
     * @param stream nodejs文件流
     */
    getDependencies(file) {
        file.extname = ph.extname(file.path);
        let dirname = ph.dirname(file.path);
        let dependenciesConfig = this.config.find(value => {
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
            if (value == 'config.js') {
                let a = 1;
            }
            if (this.isAlias(value) && dependenciesConfig.haveAlias) {
                let depFilePath = ph.join(dirname, value + '.js');
                if (fs.existsSync(depFilePath)) {
                    return this.clearPath(depFilePath);
                }
                else {
                    return value;
                }
            }
            let path = this.clearPath(ph.join(ph.dirname(file.path), value));
            //补后缀
            path = ph.extname(value) && this.extNameList.indexOf(ph.extname(value)) !== -1 ? value : value + dependenciesConfig.extname;
            if (fs.existsSync(path)) {
                return path;
            }
            else {
                return value;
            }
        });
        return {
            path: this.clearPath(file.path),
            dep: [...new Set(depArr)],
            beDep: [],
            md5: md5(content),
            extend: {}
        };
    }
    /**
     * 根据文件流获取依赖对象
     * @param stream nodejs文件流
     */
    changeMd5Name(file) {
        return __awaiter(this, void 0, void 0, function* () {
            file.extname = ph.extname(file.path);
            let dependenciesConfig = this.config.find(value => {
                let extnameAlias = value.extnameAlias && value.extnameAlias.find(value => value == file.extname);
                return value.extname == file.extname || !!extnameAlias;
            });
            if (!dependenciesConfig)
                return;
            let content = file.contents.toString();
            let depArr = [];
            let depObj = yield this.getDependenciesByPath(file.path);
            dependenciesConfig.parserRegExpList.forEach(value => {
                let match = value.match.split('$').filter(value => !!value).map(value => Number(value));
                content = content.replace(value.regExp, function (word, $1, $2, $3, $4, $5) {
                    let path = arguments[match[0]];
                    let extname = ph.extname(path);
                    let newPath = path.replace(RegExp(extname + '$'), depObj.md5 + '.' + extname);
                    return word.replace(path);
                });
            });
            return file;
        });
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
        let dependenciesConfig = this.config.find(value => value.extname == extname);
        if (dependenciesConfig) {
            dependenciesConfig.parserRegExpList.push({
                regExp: regExp,
                match: match
            });
        }
        else {
            this.config.push({
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
        let dependenciesConfig = this.config.find(value => value.extname == extname);
        if (dependenciesConfig) {
            dependenciesConfig.extnameAlias = dependenciesConfig.extnameAlias || [];
            dependenciesConfig.extnameAlias.push(alias);
        }
        else {
            this.config.push({
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
        path = path.replace(/\\/g, '/')
            .replace(/\/\//g, '/')
            .replace(/([^\.])\.\//g, '$1/');
        let cwd = process.cwd().replace(/\\/g, '/');
        if (path.indexOf(cwd) == 0) {
            path = path.replace(cwd, '');
        }
        path = path.replace(/^\//g, '');
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = new AxibaDependencies();

//# sourceMappingURL=index.js.map
