// 城市选择-级联组件-功能
// 公用-左侧和头部
var cascaderCommon = {
    template: `
        <div class="cascader_com">
            <div class="cascader_header">
                    <div class="get_level">选择筛选层级</div>
                    <ul class="way_list">
                        <li class="awy_item" v-for="(type,index) in cascaderName" v-if="index <= curlevel" :key="index">
                            选择{{type.label}}</li>
                    </ul>
            </div>
            <ul class="cascader_left text_ellipsis">
                <li :class="{active:index == curlevel}" class="cursor_p" v-for="(type,index) in cascaderName" :key="index" @click="changeLevel(index)">按{{type.label}}</li>
            </ul>
        </div>
    `,
    data() {
        return {
            cascaderName: [{
                value: '1',
                label: '城市'
            }, {
                value: '2',
                label: '区域'
            }, {
                value: '3',
                label: '板块'
            }],
        }
    },
    props: ['curlevel'],
    mounted() {
    },
    methods: {
        // 按什么方式选择
        changeLevel(index) {
            this.$emit('getlevel', index)
        },
    }
};


var cascaderComponet = {
    template: `
    <!-- 城市区域选择-模板 -->
    <div class="cascader_main">
        <!-- popover-单选-->
        <el-popover v-if="!ismulti" placement="bottom" v-model="visibleRadio" popper-class="selectPanel myradioCascader" width="400" trigger="click">
            <!-- 选择面板 -->
            <div class="cascader_content">
                <cascader-common :curlevel="curLevel" @getlevel="setFiltersData"> </cascader-common >
                <div class="cascader_right">
                    <el-cascader-panel class="cascader_center" v-model="radioValue" :props="radioProps" :show-all-levels="false" :options="options"
                        @change="handleRadioChange" @expand-change="handleParentChange">
                    </el-cascader-panel>
                </div>
            </div>

            <el-button slot="reference">{{radioObjs?radioObjs.label:'请选择'}}</el-button>
        </el-popover>
        <!-- popover-多选-->
        <el-popover v-if="ismulti"  placement="bottom" v-model="visibleMulti" popper-class="selectPanel myMultiCascader" width="400" trigger="click">
            <!-- 选择面板 -->
            <div class="cascader_content">
                <cascader-common :curlevel="curLevel" @getlevel="setFiltersData"> </cascader-common >
                <div class="cascader_right">
                    <el-cascader-panel class="cascader_center" v-model="multiValue" :props="MultiProps" :show-all-levels="false" :options="options"
                        @change="handleMultiChange" @expand-change="handleParentChange">
                    </el-cascader-panel>
                </div>
            </div>
            <el-button slot="reference" :title="multiTextArr">
                {{multiTextArr?multiTextArr:'请选择'}}
            </el-button>
        </el-popover>
    </div>
    `,//必须绑定一个模板
    data() {
        return {
            allOptions: null, //cascader数据
            options: null, //cascader数据
            radioValue: [], //默认值/单选获取项的id ["zhinan"]
            radioObjs: [], //单选获取值的obj
            curLevel: 0, //等级索引值,0城市、1区域、2板块
            // ======新-单选======
            visibleRadio: false,
            visibleMulti: false,
            radioProps: {
                multiple: false
            },
            MultiProps: {
                multiple: true
            },
            multiValue: [], //默认值/多选获取值的id ,[["zhinan"],["zujian"]] 或 [["zhinan", "shejiyuanze"],["zhinan", "daohang"]] 
            multiTexts: [],//多选获取值的obj
            curParentId: null,
            // ismulti:true, //false单选，true多选
        }
    },
    components: {
        'cascaderCommon': cascaderCommon,
    },
    props: {
        //false单选，true多选
        'optiondatas': {
            type: Array,
            default: function () {
                return [];
            }
        },
        //false单选，true多选
        'ismulti': {
            type: Boolean,
            default: false
        },
        'defaultvalue': {
            type: Array,
            default: function () {
                return [];
            }
        },
        'defaultlevel': {
            type: [String, Number],
            default: 1
        },
    },
    watch: {
    },
    computed: {
        multiTextArr: function () {
            let multiArr = [];
            this.multiTexts.forEach((item, index) => {
                multiArr.push(item.label);
            });
            return multiArr.join(",");
        }
    },
    mounted() {
        this.allOptions = this.optiondatas;

        this.curLevel = this.defaultlevel;
        // 多选时，获取默认节点
        if (this.curLevel > 0) {
            this.curParentId = this.defaultvalue[0].slice(0, this.defaultvalue[0].length - 1)
        }
        this.setFiltersData(this.curLevel);
        // 初始到那一层级，需要后台返回，默认不能写死到第一层，否则默认值到区或板块时会报错
        this.options = this.filtersData(this.curLevel + 1, this.allOptions);
        if (!this.ismulti) {
            this.radioValue = this.defaultvalue;
            this.getRadioObj(this.radioValue);
        } else {
            this.multiValue = this.defaultvalue;
            this.getMultiObj();
        }
        // this.handleParentChange(["zhinan", "shejiyuanze"])
        $('.cascader_center').trigger("expand-change");
        console.log( this.radioValue,54)
    },
    methods: {
        /**
         * @param {*} data
         * @param {*} level   获取几级
         */
        filtersData(level = this.level, datas = areaData) {
            let copyData = JSON.parse(JSON.stringify(datas));
            switch (level) {
                case 1:
                    copyData.forEach(data => {
                        if (data.children && data.children.length > 0) {
                            delete data["children"];
                        }
                    });
                    return copyData;
                case 2:
                    copyData.forEach(data => {
                        if (data.children && data.children.length > 0) {
                            data.children.forEach(child => {
                                if (child.children) {
                                    delete child["children"];
                                }
                            });
                        }
                    });
                    return copyData;

                default:
                    return copyData;
            }
        },
        // 筛选得到vlue(key)，label对象数组
        // val 选中的所有的id的数据,例['shanghai']或["zhinan", "shejiyuanze"],opt 全部数据即this.options
        getCascaderObj(val, data) {
            return val.map(function (value, index, array) {
                for (var itm of data) {
                    if (itm.value == value) {
                        if (itm.children) {
                            data = itm.children;
                        }
                        return itm;
                    }
                }
                return null;
            });
        },
        // 按什么方式选择
        setFiltersData(index) {
            console.log(index)
            this.curLevel = index;
            this.options = this.filtersData(this.curLevel + 1, this.allOptions);
            let curClass = "cascader_center el-cascader-panel is-bordered active" + this.curLevel;
            $('.myMultiCascader .cascader_center').removeClass().addClass(curClass)
        },
        // 切换节点
        handleParentChange(val) {
            console.log('切换节点',val)
            this.curParentId = val;
        },
        // 单选-根据id获取obj对象
        getRadioObj(valKey) {
            let curRadioObj = this.getCascaderObj(valKey, this.options);
            this.radioObjs = curRadioObj[curRadioObj.length - 1];
        },
        // 多选-根据id获取obj对象
        getMultiObj() {
            this.multiTexts = [];
            this.multiValue.forEach((itemKey, indexKey) => {
                let itemText = this.getCascaderObj(itemKey, this.options)
                this.multiTexts.push(itemText[itemText.length - 1]);
            });
        },
        // 单选-选中事件（获取选中的结果）
        handleRadioChange(val) {
            this.getRadioObj(val);
            this.commitCascader(this.radioValue, this.radioObjs);
            // console.log('单选id:',this.radioValue, '单选obj:',this.radioObjs)
        },
        // 多选-选中事件（获取选中的结果）
        handleMultiChange(val) {
            this.multiValue = [];
            val.forEach((item, index) => {
                if ( item.length >1 && item.length <= 2) {
                    if (this.curParentId[0] == item[0]) {
                        this.multiValue.push(item);
                    }
                }else if (item.length > 2){
                    if (this.curParentId[0] == item[0] && this.curParentId[1] == item[1]) {
                        this.multiValue.push(item);
                    }
                }else {
                    this.multiValue.push(item);
                }
            })
            this.getMultiObj();
            this.commitCascader(this.multiValue, this.multiTexts);
            // console.log('多选id',this.multiValue,'多选obj',this.multiTexts);
        },
        // 提交数据，val要提交的id，obj对象
        commitCascader(val, obj) {
            // console.log('提交',val,obj)
            this.$emit('getcascadercal', val, obj)
        },
    }
}
// 全局注册
Vue.component('myCascader', cascaderComponet);
