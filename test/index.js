"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const axiba_unit_test_1 = require('axiba-unit-test');
const index_1 = require('../src/index');
const Vinyl = require('vinyl');
// Dependencies.dependenciesArray = [
// ]
axiba_unit_test_1.describeClass('依赖分析', index_1.default, () => {
    axiba_unit_test_1.itClass('match', () => {
        axiba_unit_test_1.itAdd(['1234567891033', /(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)/g, [2]], value => value.length == 1);
        axiba_unit_test_1.itAdd(['require("md5")', /(require\(")(md5)("\))/g, [2]], value => value[0] == 'md5');
        axiba_unit_test_1.itAdd(['@import "a1";@import \'a2\'', /@import "(.+)"/g, [1]], value => value[0] == 'a1');
    });
    axiba_unit_test_1.itClass('clearPathParameter', () => {
        axiba_unit_test_1.itAdd(['/ddd/dfdf/dfdf?ddd=1'], value => value == '/ddd/dfdf/dfdf');
    });
    axiba_unit_test_1.itClass('clearPath', () => {
        let fun = value => value == '/eest/e.t';
        axiba_unit_test_1.itAdd(['//eest//e.t'], fun);
        axiba_unit_test_1.itAdd(['\\eest\\e.t?123123'], fun);
        axiba_unit_test_1.itAdd(['./ee./st/e.t?sss=123123'], value => value == './ee/st/e.t');
        axiba_unit_test_1.itAdd(['../ee./st/e.t?sss=123123'], value => value == '../ee/st/e.t');
    });
    axiba_unit_test_1.itClass('addAlias', () => {
        axiba_unit_test_1.itAdd(['.less', '_less'], value => index_1.default.confing.find(value => value.extname == '.less').extnameAlias[0] == '_less');
    });
    axiba_unit_test_1.itClass('isAlias', () => {
        axiba_unit_test_1.itAdd(['sss.less'], value => !value);
        axiba_unit_test_1.itAdd(['react'], value => value);
        axiba_unit_test_1.itAdd(['react-deadf'], value => value);
    });
    axiba_unit_test_1.itClass('addParserRegExp', () => {
        let reg = /@import (['"])(.+?)(['"])/g;
        axiba_unit_test_1.itAdd(['.less', reg, '$2'], value => {
            let config = index_1.default.confing.find(value => value.extname == '.less');
            return config.parserRegExpList.find(value => value.match == '$2');
        });
        reg = /(@import) +(['"])(.+?)(['"])/g;
        axiba_unit_test_1.itAdd(['.less', reg, '$3'], value => {
            let config = index_1.default.confing.find(value => value.extname == '.less');
            return config.parserRegExpList.find(value => value.regExp == reg && value.match == '$3');
        });
    });
    axiba_unit_test_1.itClass('getDependencies', () => {
        let lessFile = new Vinyl({
            cwd: '/',
            base: '/test/',
            path: '/test/file.less',
            contents: new Buffer('@import "a1";@import \'a2\'')
        });
        axiba_unit_test_1.itAdd([lessFile], value => {
            return !!value.dep.find(value => value == "/test/a1.less");
        });
        axiba_unit_test_1.itAdd([lessFile], value => {
            return !!value.dep.find(value => value == "/test/a2.less");
        });
        let jsFile = new Vinyl({
            cwd: '/',
            base: '/test/',
            path: '/test/ddd.js',
            contents: new Buffer("require('./testLess.less');require('./aaaa.ddd');")
        });
        axiba_unit_test_1.itAdd([jsFile], value => {
            return !!value.dep.find(value => value == "/test/aaaa.ddd.js");
        });
        axiba_unit_test_1.itAdd([jsFile], value => {
            return !!value.dep.find(value => value == "/test/testLess.less");
        });
        let tsFile = new Vinyl({
            cwd: '/',
            base: '/test/',
            path: '/test/ddd.ts',
            contents: new Buffer("import './test.less';import 'gulp';")
        });
        axiba_unit_test_1.itAdd([tsFile], value => {
            return !!value.dep.find(value => value == "/test/test.less");
        });
        axiba_unit_test_1.itAdd([tsFile], value => {
            return !!value.dep.find(value => value == "gulp");
        });
    });
    axiba_unit_test_1.itClass('src', () => {
        axiba_unit_test_1.itAdd(['node_modules/react/lib/React.js'], value => {
            return true;
        }, 900000);
        axiba_unit_test_1.itAdd(['node_modules/react/**/*.js'], value => {
            return true;
        }, 900000);
        axiba_unit_test_1.itAdd(['assets/**/*.*'], value => {
            return true;
        }, 900000);
        axiba_unit_test_1.itAdd(['assets/**/*.less'], value => {
            index_1.default.createJsonFile();
            return index_1.default.dependenciesArray.length != 0;
        }, 900000);
    });
    axiba_unit_test_1.itClass('getDependenciesArr', () => {
        axiba_unit_test_1.itAdd(["assets/pages/msgset/index.less"], value => {
            return value.length == 1;
        });
        axiba_unit_test_1.itAdd(["assets/components/global/styles/index.less"], value => {
            return value.indexOf('assets/components/global/styles/qikexiu/index.less') != -1 && value.filter(value => value === 'assets/components/global/styles/qikexiu/index.less').length === 1;
        });
    });
    axiba_unit_test_1.itClass('getBeDependenciesArr', () => {
        axiba_unit_test_1.itAdd(["assets/components/global/styles/qikexiu/index.less"], value => {
            return value.indexOf("assets/components/global/styles/index.less") > -1;
        });
    });
    axiba_unit_test_1.itClass('addBeDep', () => {
        axiba_unit_test_1.itAdd(["assets/pages/msgset/test.less", "assets/pages/msgset/testBe.less"], (value) => __awaiter(this, void 0, void 0, function* () {
            let arr = yield index_1.default.getBeDependenciesArr("assets/pages/msgset/test.less");
            return arr.indexOf("assets/pages/msgset/testBe.less") !== -1;
        }));
        axiba_unit_test_1.itAdd(["assets/pages/msgset/test.less", "assets/pages/msgset/testBe22.less"], (value) => __awaiter(this, void 0, void 0, function* () {
            let arr = yield index_1.default.getBeDependenciesArr("assets/pages/msgset/test.less");
            return arr.indexOf("assets/pages/msgset/testBe22.less") !== -1;
        }));
    });
    axiba_unit_test_1.itClass('delBeDep', () => {
        axiba_unit_test_1.itAdd(["assets/pages/msgset/test.less", "assets/pages/msgset/testBe.less"], (value) => __awaiter(this, void 0, void 0, function* () {
            let arr = yield index_1.default.getBeDependenciesArr("assets/pages/msgset/test.less");
            return arr.indexOf("assets/pages/msgset/testBe.less") == -1;
        }));
    });
    axiba_unit_test_1.itClass('createJsonFile', () => {
        axiba_unit_test_1.itAdd([], value => true);
    });
});
axiba_unit_test_1.run();

//# sourceMappingURL=index.js.map
