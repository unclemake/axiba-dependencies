import * as gulp from 'gulp';
import * as gulpUtil from 'gulp-util';
import * as through from 'through2';
import * as ph from 'path';
import * as fs from 'fs';
import * as stream from 'stream';
import md5 = require('md5');


declare let require: any;
let json;
try {
    json = require(process.cwd() + '/dependencies.json');
} catch (error) {
    json = [];
}

/** 
* 依赖数据模型
*/
export interface DependenciesModel {
    //文件路径
    path: string
    //文件依赖
    dep: string[],
    //文件被依赖
    beDep: string[],
    //文件名md5
    md5: string
}

/** 
 * 配置
 */
export interface DependenciesConfig {

    /**
    * 后缀名
    */
    extname: string

    /**
   * 解析正则列表
   */
    parserRegExpList: {
        regExp: RegExp,
        match: string
    }[]

    /**
     * 后缀别名
     */
    extnameAlias?: string[]

    /** 有别名 比如js */
    haveAlias?: boolean

    /** 补后缀 */
    completionExtname?: boolean
}

/**
 * 依赖
 */
export default new class AxibaDependencies {

    /** 
    * 配置
    */
    confing: DependenciesConfig[] = [
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
    ]

    extNameList = ['.less', '.js', '.css']


    /** 
    * 临时依赖列表
    */
    dependenciesArray: DependenciesModel[] = json


    /**
    * 根据glob路径 扫描依赖
    * @param glob
    */
    src(glob: string | string[]): Promise<DependenciesModel[]> {
        return new Promise((resolve, reject) => {
            gulp.src(glob)
                .pipe(this.readWriteStream())
                .on('finish', () => {
                    resolve(this.dependenciesArray);
                });
        })
    }



    /**
     * 生成依赖json文件
     * @param  {string='./dependencies.json'} path
     * @returns Promise
     */
    createJsonFile(path: string = process.cwd() + '/dependencies.json'): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(this.dependenciesArray), 'utf8', () => {
                resolve();
            });
        })
    }


    /**
     * 数据流 分析
     */
    readWriteStream(): stream.Transform {
        return through.obj((file: gulpUtil.File, enc, callback) => {
            let dependenciesModel = this.getDependencies(file);

            // 没有此文件后缀的匹配会跳出
            if (!dependenciesModel) {
                return callback(null, file);
            }

            this.delByPath(dependenciesModel.path);
            this.dependenciesArray.push(dependenciesModel);
            dependenciesModel.dep.forEach(value => {
                this.addBeDep(value, dependenciesModel.path);
            });


            callback(null, file);
        });
    }

    /**
     * 根据path删除依赖
     * @param  {string} path
     */
    delByPath(path: string) {
        let depObjectOld = this.dependenciesArray.find(value => value.path === this.clearPath(path));

        if (depObjectOld) {
            depObjectOld.dep.forEach(value => this.delBeDep(value, path));

            if (depObjectOld.beDep.length === 0) {
                this.dependenciesArray.splice(this.dependenciesArray.findIndex(value => value === depObjectOld), 1);
            }
        }
    }


    /**
     * 删除 path 的beDep 被依赖
     * @param  {string} path
     * @param  {string} beDep
     */
    delBeDep(path: string, beDep: string) {
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
    addBeDep(path: string, beDep: string) {
        let depObject = this.dependenciesArray.find(value => value.path === path);

        if (depObject) {
            depObject.beDep.find(value => value == beDep) || depObject.beDep.push(beDep);
        } else {
            this.dependenciesArray.push({
                path: path,
                beDep: [beDep],
                dep: [],
                md5: ''
            })
        }
    }


    /** 记录getDependenciesArr编列扫描了哪些path 防止死循环 */
    recordGetDependenciesPath: Array<string>;
    /**
     * 根据路劲获取依赖数组
     * @param  {string} path 路劲
     * @param  {boolean} bl 是否是首个路劲
     * @returns string[]
     */
    getDependenciesArr(path: string, bl = true): string[] {
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


    /** 记录getDependenciesArr编列扫描了哪些path 防止死循环 */
    recordGetBeDependenciesPath: Array<string>;
    /**
     * 根据路劲获取被依赖数组
     * @param  {string} path 路劲
     * @param  {boolean} bl 是否是首个路劲
     * @returns string[]
     */
    getBeDependenciesArr(path: string, bl = true): string[] {
        bl && (this.recordGetBeDependenciesPath = []);

        // 如果已经查找过 跳出
        if (this.recordGetBeDependenciesPath.find(value => value == path)) {
            return [];
        }

        this.recordGetBeDependenciesPath.push(path);
        path = this.clearPath(path);
        let depArr = [];

        let depObject = this.dependenciesArray.find(value => value.path == path);

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
    }


    /**
     * 根据path获取依赖
     * @param path
     */
    getDependenciesByPath(path: string): DependenciesModel {
        path = this.clearPath(path);
        return this.dependenciesArray.find(value => value.path === path);
    }



    /**
     * 根据文件流获取依赖
     * @param stream nodejs文件流
     */
    getDependencies(file: gulpUtil.File): DependenciesModel {
        file.extname = ph.extname(file.path);
        let dependenciesConfig = this.confing.find(value => {
            let extnameAlias = value.extnameAlias && value.extnameAlias.find(value => value == file.extname);
            return value.extname == file.extname || !!extnameAlias;
        });

        if (!dependenciesConfig) return;

        let content = file.contents.toString();
        let depArr: string[] = [];

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
                    value = ph.extname(value) && this.extNameList.indexOf(ph.extname(value)) !== -1 ? value : value + dependenciesConfig.extname;
                }
            }
            return value;
        });


        return {
            path: this.clearPath(file.path),
            dep: [...new Set(depArr)],
            beDep: [],
            md5: md5(content)
        }
    }


    /**
     * 获取匹配字段
     * @param content 匹配字符串
     * @param regExp 正则
     * @param match  获取第几个$1
     */
    match(content: string, regExp: RegExp, match: number[]): string[] {
        let strArr = [];
        content.replace(regExp, function ($1, $2, $3, $4, $5) {
            let str = '';
            let args = arguments;
            match.forEach(value => {
                str += args[value];
            })
            str && strArr.push(str);
        } as any);
        return strArr;
    }


    /**
     * 添加依赖解析正则
     * @param extname 后缀
     * @param regExp 正则
     * @param match 匹配 $1$2
     */
    addParserRegExp(extname: string, regExp: RegExp, match?: string): void {
        let dependenciesConfig = this.confing.find(value => value.extname == extname);

        if (dependenciesConfig) {
            dependenciesConfig.parserRegExpList.push({
                regExp: regExp,
                match: match
            });
        } else {
            this.confing.push({
                extname: extname,
                parserRegExpList: [{
                    regExp: regExp,
                    match: match
                }],
                extnameAlias: []
            })
        }
    }


    /**
     * 添加别名
     * @param extname 后缀
     * @param alias 别名
     */
    addAlias(extname: string, alias: string): void {
        let dependenciesConfig = this.confing.find(value => value.extname == extname);

        if (dependenciesConfig) {
            dependenciesConfig.extnameAlias = dependenciesConfig.extnameAlias || [];
            dependenciesConfig.extnameAlias.push(alias);
        } else {
            this.confing.push({
                extname: extname,
                parserRegExpList: [],
                extnameAlias: [alias]
            })
        }
    }


    /**
     * 清理路劲
     * @param path
     */
    clearPath(path: string) {
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
    clearPathParameter(path: string): string {
        return path.replace(/\?.+/g, '').replace(/#.+/g, '');
    }


}
