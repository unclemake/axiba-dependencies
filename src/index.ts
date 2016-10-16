import * as gulp from 'gulp';
import * as gulpUtil from 'gulp-util';
import * as through from 'through2';
import * as ph from 'path';
import * as fs from 'fs';
import md5 = require('md5');


declare let require: any;
let json;
try {
    json = require(process.cwd() + '/dependent.json');
} catch (error) {
    json = [];
}

/** 
* 依赖数据模型
*/
export interface DependentType {
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
export interface DependentConfig {

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
export default new class AxibaDependent {

    /** 
    * 配置
    */
    confing: DependentConfig[] = [
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


    /** 
    * 临时依赖列表
    */
    dependentList: DependentType[] = json


    /**
    * 根据glob路径 扫描依赖
    * @param glob
    */
    src(glob: string | string[]): Promise<DependentType[]> {
        return new Promise((resolve, reject) => {
            gulp.src(glob)
                .pipe(this.getReadWriteStream())
                .on('finish', () => {
                    resolve(this.dependentList);
                });
        })
    }



    /**
     * 生成依赖json文件
     * @param  {string='./dependent.json'} path
     * @returns Promise
     */
    createJsonFile(path: string = './dependent.json'): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(this.dependentList), 'utf8', () => {
                console.log('依赖json文件生成成功！');
                resolve();
            });
        })
    }


    /**
     * 添加到临时依赖列表
     */
    private getReadWriteStream(): NodeJS.ReadWriteStream {
        return through.obj((file: gulpUtil.File, enc, callback) => {
            let dependentType = this.getDependent(file);

            if (!dependentType) {
                return callback();
            }

            let dep = this.dependentList.find(value => {
                return value.path == this.clearPath(file.path)
            });

            if (dep) {
                dep.dep = dependentType.dep;
            } else {
                this.dependentList.push(dependentType);
            }

            callback();

        });
    }



    /** 记录getDependentArr编列获取了哪些path 防止死循环 */
    recordGetDependentPath: Array<string>;
    /**
     * 根据路劲获取依赖数组
     * @param  {string} path 路劲
     * @param  {boolean} bl 是否是首个路劲
     * @returns string[]
     */
    getDependentArr(path: string, bl = true): string[] {
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
    getDependent(file: gulpUtil.File): DependentType {
        file.extname = ph.extname(file.path);
        let dependentConfig = this.confing.find(value => {
            let extnameAlias = value.extnameAlias && value.extnameAlias.find(value => value == file.extname);
            return value.extname == file.extname || !!extnameAlias;
        });

        if (!dependentConfig) return;

        let content = file.contents.toString();
        let depArr: string[] = [];

        dependentConfig.parserRegExpList.forEach(value => {
            let match = value.match.split('$').filter(value => !!value).map(value => Number(value));
            let path = this.match(content, value.regExp, match);
            depArr = depArr.concat(path);
        });

        depArr = depArr.map(value => {
            value = this.clearPath(value);

            if (value.indexOf("_sidebar") != -1) {
                let a1 = 1;
            }

            if (value.indexOf('/') != -1 || !dependentConfig.haveAlias) {
                value = this.clearPath(ph.join(ph.dirname(file.path), value));

                if (dependentConfig.completionExtname) {
                    value = ph.extname(value) != dependentConfig.extname ? value : value + dependentConfig.extname;
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
        let dependentConfig = this.confing.find(value => value.extname == extname);

        if (dependentConfig) {
            dependentConfig.parserRegExpList.push({
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
        let dependentConfig = this.confing.find(value => value.extname == extname);

        if (dependentConfig) {
            dependentConfig.extnameAlias = dependentConfig.extnameAlias || [];
            dependentConfig.extnameAlias.push(alias);
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
