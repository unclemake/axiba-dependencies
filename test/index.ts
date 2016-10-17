import { TestModule, TestUnit, describe, describeClass, its, run, it, itAdd, itClass } from 'axiba-unit-test';
import Dependencies from '../src/index';
import * as gulpUtil from '../src/index';
import Vinyl = require('vinyl');

Dependencies.dependenciesList = [
    {
        "path": "assets/pages/msgset/index.less",
        "dep": [
            "assets/components/global/styles/qikexiu/_quick.less"
        ],
        "beDep": [],
        "md5": "da99c19f6294927f184438ca88b5f57d"
    },
    {
        "path": "assets/pages/reception/index.less",
        "dep": [
            "assets/components/global/styles/qikexiu/_quick.less"
        ],
        "beDep": [],
        "md5": "6505a29aa6c8a43c94585d32498a1b51"
    },
    {
        "path": "assets/components/global/styles/index.less",
        "dep": [
            "assets/components/global/styles/qikexiu/index.less",
            "assets/components/global/styles/_sidebar.less",
            "assets/components/global/styles/_layer.less",
            "assets/components/global/styles/_checkbox.less"
        ],
        "beDep": [],
        "md5": "7cf3ff5caeff547e1b28167194052ca8"
    },
    {
        "path": "assets/components/global/styles/ipad.less",
        "dep": [
            "assets/components/global/styles/qikexiu/index.less",
            "assets/components/global/styles/_layer.less"
        ],
        "beDep": [],
        "md5": "1198232e02da6bbf1716cc06db5640a1"
    },
    {
        "path": "assets/components/global/styles/_checkbox.less",
        "dep": [
            "assets/components/global/styles/qikexiu/_quick.less"
        ],
        "beDep": [],
        "md5": "e77267802b13671861ccbf6fd6d0ccb0"
    },
    {
        "path": "assets/components/global/styles/_layer.less",
        "dep": [
            "assets/components/global/styles/qikexiu/_quick.less"
        ],
        "beDep": [],
        "md5": "86c98d8cf09e195e4ec3aee685e99dcc"
    },
    {
        "path": "assets/components/global/styles/_sidebar.less",
        "dep": [
            "assets/components/global/styles/qikexiu/_quick.less"
        ],
        "beDep": [],
        "md5": "a9e1cc6d5d5e848657cbb369393fbc3a"
    },
    {
        "path": "assets/components/scroll/demo/demo.less",
        "dep": [],
        "beDep": [],
        "md5": "52cc37afc941d80b44a51d02d8b71d68"
    },
    {
        "path": "assets/components/global/styles/qikexiu/index.less",
        "dep": [
            "assets/components/global/styles/qikexiu/_reset.less",
            "assets/components/global/styles/qikexiu/_base.less",
            "assets/components/global/styles/qikexiu/_grid.less",
            "assets/components/global/styles/qikexiu/_icon.less",
            "assets/components/global/styles/qikexiu/_theme.less"
        ],
        "beDep": [],
        "md5": "383ba3b05146651252d9ba762a00e7d0"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_base.less",
        "dep": [],
        "beDep": [],
        "md5": "41506a2b818e0b12c760b4baa4b26f71"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_config.less",
        "dep": [],
        "beDep": [],
        "md5": "e6fc23078cc26595890c6ca30e702039"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_grid.less",
        "dep": [],
        "beDep": [],
        "md5": "582af7782633b356a70cb84c93bbf36c"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_icon.less",
        "dep": [],
        "beDep": [],
        "md5": "97152095557732a13ae23e9bbf2aa0f1"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_quick.less",
        "dep": [],
        "beDep": [],
        "md5": "fcce189fa6522e3c45763ec606d417be"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_reset.less",
        "dep": [],
        "beDep": [],
        "md5": "380dc1030a7b0a27010ced5c1d897f38"
    },
    {
        "path": "assets/components/global/styles/qikexiu/_theme.less",
        "dep": [],
        "beDep": [],
        "md5": "ae14cf1812797d8cec77139c6b1d7f05"
    },
    {
        "path": "assets/components/ajax/ajax.min.js",
        "dep": [
            "type-of"
        ],
        "beDep": [],
        "md5": "98449e8eeb9a62b6512752936d8d838c"
    },
    {
        "path": "assets/components/ajax/index.js",
        "dep": [
            "type-of"
        ],
        "beDep": [],
        "md5": "eb07149daa3a17082a3dd753b7b433ce"
    },
    {
        "path": "assets/components/checkbox/index.js",
        "dep": [
            "react"
        ],
        "beDep": [],
        "md5": "94d0b5296ac0d19680ee274e902ec582"
    },
    {
        "path": "assets/components/global/config.js",
        "dep": [],
        "beDep": [],
        "md5": "516f364de08037430a89a925ffa8ffbc"
    },
    {
        "path": "assets/components/global/index.js",
        "dep": [
            "ReactPropTypes",
            "createArrayFromMixed",
            "react",
            "redux",
            "assets/components/global/node_modules/flux-standard-action/node_modules/lodash.isplainobject/index.js",
            "assets/components/global/node_modules/flux-standard-action/node_modules/lodash.isplainobject/node_modules/lodash._basefor/index.js",
            "lodash.isarguments",
            "assets/components/global/node_modules/flux-standard-action/node_modules/lodash.isplainobject/node_modules/lodash.keysin/index.js",
            "assets/components/global/node_modules/flux-standard-action/node_modules/lodash.isplainobject/node_modules/lodash.keysin/node_modules/lodash.isarray/index.js",
            "assets/components/global/handleAction.js",
            "assets/components/global/ownKeys.js",
            "assets/components/global/node_modules/reduce-reducers/lib/index.js",
            "assets/components/global/createAction.js",
            "assets/components/global/handleActions.js",
            "assets/components/global/reducer.js",
            "assets/components/global/actions.js",
            "assets/components/global/sync.js",
            "assets/components/global/middleware.js"
        ],
        "beDep": [],
        "md5": "5a1fd89a62d81264472c98603cf0f8c0"
    },
    {
        "path": "assets/components/global/node.js",
        "dep": [],
        "beDep": [],
        "md5": "32a8798b317faeacf74d893a0efcb3c2"
    },
    {
        "path": "assets/components/global/typescript.js",
        "dep": [],
        "beDep": [],
        "md5": "f8573ac2084efe803686d2771877c8e7"
    },
    {
        "path": "assets/components/layer/index.js",
        "dep": [
            "react",
            "react-dom"
        ],
        "beDep": [],
        "md5": "1ef3bab5dde26b03f8d545988f1f8dfd"
    },
    {
        "path": "assets/components/paging/index.js",
        "dep": [
            "react",
            "assets/components/layer/index.js"
        ],
        "beDep": [],
        "md5": "922ef73dbc1279d75ce7b9026181fac0"
    },
    {
        "path": "assets/components/scroll/inde.js",
        "dep": [
            "react",
            "react-dom",
            "assets/components/scroll/dist/demo.css"
        ],
        "beDep": [],
        "md5": "856737ddbd02721bd05ac713bd334907"
    },
    {
        "path": "assets/components/scroll/index.js",
        "dep": [
            "react",
            "react-dom",
            "assets/components/scroll/dist/demo.css"
        ],
        "beDep": [],
        "md5": "e1cac2cb71dde90e1cd89875c175a44c"
    },
    {
        "path": "assets/components/scroll/webpack.config.js",
        "dep": [
            "webpack",
            "extract-text-webpack-plugin"
        ],
        "beDep": [],
        "md5": "1e9c41a2e8e4912b4ab7ee9ed46b1c66"
    },
    {
        "path": "assets/components/util/index.js",
        "dep": [
            "lodash"
        ],
        "beDep": [],
        "md5": "ed688b56375b5237e2f0cffc10e6b778"
    },
    {
        "path": "assets/pages/error/index.js",
        "dep": [
            "react"
        ],
        "beDep": [],
        "md5": "74be569b0ecc9d93a052d3ca4686e98f"
    },
    {
        "path": "assets/pages/main/index.js",
        "dep": [
            "react",
            "react-dom",
            "react-router",
            "assets/pages/sidebar/index.js"
        ],
        "beDep": [],
        "md5": "e502026efa9372a0ec942677306321c3"
    },
    {
        "path": "assets/pages/msgset/index.js",
        "dep": [
            "react",
            "assets/components/checkbox/index.js",
            "assets/pages/msgset/index.css"
        ],
        "beDep": [],
        "md5": "159c5bc3ae8083b8a3510f0573c79672"
    },
    {
        "path": "assets/pages/reception/action.js",
        "dep": [
            "redux-actions"
        ],
        "beDep": [],
        "md5": "eeac13e59a957313caa1cf563862e8d9"
    },
    {
        "path": "assets/pages/reception/index.js",
        "dep": [
            "react",
            "assets/pages/reception/component/index.js",
            "react-redux",
            "redux",
            "assets/pages/reception/reducer.js",
            "redux-thunk",
            "assets/pages/reception/index.css"
        ],
        "beDep": [],
        "md5": "273c4d37c1cb251b68b2ce90003b80c8"
    },
    {
        "path": "assets/pages/reception/model.js",
        "dep": [],
        "beDep": [],
        "md5": "2845a67551a453d1a9115d7c1ede2d85"
    },
    {
        "path": "assets/pages/reception/reducer.js",
        "dep": [
            "redux-actions",
            "assets/pages/reception/action.js",
            "redux"
        ],
        "beDep": [],
        "md5": "ea20d141d8db2603232a57d18236490c"
    },
    {
        "path": "assets/pages/sidebar/index.js",
        "dep": [
            "react",
            "react-router"
        ],
        "beDep": [],
        "md5": "b1e6f9efe0aaea85e7e61f871c8935a9"
    },
    {
        "path": "assets/components/ajax/example/example-server.js",
        "dep": [
            "express",
            "path"
        ],
        "beDep": [],
        "md5": "35da111633cb697035a781f7ca5c89af"
    },
    {
        "path": "assets/components/scroll/dist/demo.js",
        "dep": [
            "createArrayFromMixed",
            "ReactPropTypes"
        ],
        "beDep": [],
        "md5": "67cfb048a9be0bb7a8ec41669999f992"
    },
    {
        "path": "assets/pages/reception/component/chatList.js",
        "dep": [
            "react"
        ],
        "beDep": [],
        "md5": "6e5bf306b5606a89840cb64bb4461853"
    },
    {
        "path": "assets/pages/reception/component/chatUser.js",
        "dep": [
            "react",
            "assets/components/scroll/index.js"
        ],
        "beDep": [],
        "md5": "bf547719c763d53223cd54473a4b5308"
    },
    {
        "path": "assets/pages/reception/component/ChatView.js",
        "dep": [
            "react",
            "assets/components/util/index.js",
            "assets/pages/reception/component/chatList.js"
        ],
        "beDep": [],
        "md5": "e286f4b021fc22a661e3950a269abac9"
    },
    {
        "path": "assets/pages/reception/component/index.js",
        "dep": [
            "react",
            "react-redux",
            "assets/pages/reception/action.js",
            "assets/pages/reception/component/order.js",
            "assets/pages/reception/component/chatView.js",
            "assets/pages/reception/component/chatUser.js",
            "assets/pages/reception/index.css"
        ],
        "beDep": [],
        "md5": "4afa2aae94b1e62e5c6ba8792e37c6b9"
    },
    {
        "path": "assets/pages/reception/component/order.js",
        "dep": [
            "react"
        ],
        "beDep": [],
        "md5": "3cd0be99964ef770153a984a545638f1"
    }
]

describeClass('依赖分析', Dependencies, () => {
    itClass('match', () => {
        itAdd(['1234567891033', /(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)/g, [2]], value => value.length == 1);
        itAdd(['require("md5")', /(require\(")(md5)("\))/g, [2]], value => value[0] == 'md5');
        itAdd(['@import "a1";@import \'a2\'', /@import "(.+)"/g, [1]], value => value[0] == 'a1');
    });


    itClass('clearPathParameter', () => {
        itAdd(['/ddd/dfdf/dfdf?ddd=1'], value => value == '/ddd/dfdf/dfdf');
    });

    itClass('clearPath', () => {
        let fun = value => value == '/eest/e.t';
        itAdd(['//eest//e.t'], fun);
        itAdd(['\\eest\\e.t?123123'], fun);
        itAdd(['./ee./st/e.t?sss=123123'], value => value == './ee/st/e.t');
        itAdd(['../ee./st/e.t?sss=123123'], value => value == '../ee/st/e.t');
    });


    itClass('addAlias', () => {
        itAdd(['.less', '_less'], value => Dependencies.confing.find(value => value.extname == '.less').extnameAlias[0] == '_less');
    });


    itClass('addParserRegExp', () => {
        let reg = /@import (['"])(.+?)(['"])/g;

        itAdd(['.less', reg, '$2'], value => {
            let config = Dependencies.confing.find(value => value.extname == '.less')
            return config.parserRegExpList.find(value => value.match == '$2');
        });

        reg = /(@import) +(['"])(.+?)(['"])/g;
        itAdd(['.less', reg, '$3'], value => {
            let config = Dependencies.confing.find(value => value.extname == '.less')
            return config.parserRegExpList.find(value => value.regExp == reg && value.match == '$3');
        });
    });


    itClass('getDependencies', () => {
        let lessFile = new Vinyl({
            cwd: '/',
            base: '/test/',
            path: '/test/file.less',
            contents: new Buffer('@import "a1";@import \'a2\'')
        });

        itAdd([lessFile], value => {
            return !!value.dep.find(value => value == "/test/a1.less");
        });

        itAdd([lessFile], value => {
            return !!value.dep.find(value => value == "/test/a2.less");
        });

        let jsFile = new Vinyl({
            cwd: '/',
            base: '/test/',
            path: '/test/ddd.js',
            contents: new Buffer("require('./testLess.less');require('./aaaa.ddd');")
        });

        itAdd([jsFile], value => {
            return !!value.dep.find(value => value == "/test/aaaa.ddd.js");
        });

         itAdd([jsFile], value => {
            return !!value.dep.find(value => value == "/test/testLess.less");
        });

    });

    itClass('src', () => {

        itAdd(['assets/**/*.*'], value => {
            Dependencies.createJsonFile();
            return true;
        }, 900000);

        // itAdd(['assets/**/*.less'], value => {
        //     Dependencies.createJsonFile();
        //     return Dependencies.DependenciesList.length != 0;
        // }, 900000);
    });

    itClass('getDependenciesArr', () => {
        itAdd(["assets/pages/msgset/index.less"], value => {
            return value.length == 1
        });

        itAdd(["assets/components/global/styles/index.less"], value => {
            return value.indexOf('assets/components/global/styles/qikexiu/index.less') != -1 && value.filter(value => value === 'assets/components/global/styles/qikexiu/index.less').length === 1;
        });

    })
})


run();

















