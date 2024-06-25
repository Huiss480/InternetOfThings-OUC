/**
 * 单位对应信息
 * ${env}-unit-${control} 默认是A-unit-F ${env}可以很好的区分对应环境环境
 * A-℃-T 大气-温度-控制 AIR
 * S-℃-F 土壤-温度-被控 SOIL
 * W-℃-T 水体-温度-控制 WATER
 * W-℃-T-V 水体-温度-控制-值类型 VALUE
 * W-℃-T-B 水体-温度-控制-开关类型 BOOL
 * W-℃-T-B-I 水体-温度-控制-开关类型-增益 increase (第一位和第五位主要是后端自动控制算法用)
 * W-℃-T-B-D 水体-温度-控制-开关类型-减损 decrease
 * W-℃-T-V-M 水体-温度-控制-值类型-增益减损均可 mixture
 * ${env}-${unit}[*${num}]-${isControl}-${controlType}-${effect} 
 * [*${num}] 当有参数单位一样时使用加以区分不同值并和作物参数匹配
 * 以后优化一种带特定标记的单位方案，比如两种相同单位但不是同一种参数，含氧量和空气湿度 都是%但标志可以不一样
 * 优化后结果(未使用)： ${env}-${unit}-${control}-${flag}
 */
const unitImgs = {
  "℃": {
    img: "/img/温度.png",
    value: 0,
    unit: "℃",
  },
  RH: {
    img: "/img/湿度.png",
    value: 0,
    unit: "RH",
  },
  Lux: {
    img: "/img/光照.png",
    value: 0,
    unit: "Lux",
  },
  dB: {
    img: "/img/噪声.png",
    value: 0,
    unit: "dB",
  },
  "ug/m3": {
    img: "/img/PM2.5.png",
    value: 0,
    unit: "ug/m3",
  },
  "km/s": {
    img: "/img/风速.png",
    value: 0,
    unit: "km/s",
  },
  风: {
    img: "/img/风向.png",
    value: 0,
    unit: "风",
  },
  mm: {
    img: "/img/降雨量.png",
    value: 0,
    unit: "mm",
  },
  light: {
    img: "/img/灯光.png",
    value: 0,
    unit: "light",
  },
  defult: {
    img: "/img/default.png",
    value: 0,
  },
};
/**
 *
 * @param {*} unitItem 单个传感器信息
 * @returns 单位解析后的传感器信息
 */
function decodeUnit(unitItem) {
  let tempArr = unitItem.unit.split("-");
  unitItem.dot=parseInt(unitItem.dot)
console.log(tempArr)
  if (tempArr.length == 1  && tempArr[0] != "`") {
    //兼容只有单位的情况
    unitItem.env = "A";
    unitItem.originUnit = unitItem.unit;
    unitItem.unit = tempArr[0];
    unitItem.control = "F";
  } else if (tempArr.length >= 3) {
    //扩展单位，三参数
    unitItem.originUnit = unitItem.unit;
    unitItem.env = tempArr[0].split('*')[0];
    unitItem.unit = tempArr[1];
    unitItem.control = tempArr[2];
    if (tempArr[2] == "T") {
      //兼容三参数
      unitItem.controlType = "B"; //默认开关量
    }
    if (tempArr.length >=4) {
      //兼容四参数
      unitItem.controlType = tempArr[3];
    }
  }
  return unitItem;
}
/**
 * 根据参数单位融合参数图片
 * @param {*} units 传入某个监测单元下的所有传感器信息
 * [
 * {
 * unit:'A-℃-F',
 * name:'温度1',
 * value:'',
 * }
 * ]
 */
function unitAddImg(units = []) {
  for (let unit of units) {
    unit = decodeUnit(unit);
    if (unit.unit in unitImgs) {
      Object.assign(unit, unitImgs[unit.unit]);
    } else {
      Object.assign(unit, unitImgs["defult"]);
    }
  }
  return units;
}
window.unitAddImg = unitAddImg;

//区分控制和被控参数函数
window.unitSplit = function (units = []) {
  let unitObj = {
    sensorDataList: [],
    sensorControlList: [],
    sensorControlIndex: [],
  };
  console.log(units);
  units.forEach((e, i, a) => {
    if (e.control == "T") {
      unitObj.sensorControlList.push(e);
      unitObj.sensorControlIndex.push(e.id);
    } else if (e.control == "F") {
      unitObj.sensorDataList.push(e);
    }
  });
  return unitObj;
};

/**
 * 示例
 */
function exampleUnitAddImg() {
  console.log(
    unitAddImg([
      {
        id: "1",
        name: "风速",
        unit: "S-123-F",
      },
    ])
  );
}
// exampleUnitAddImg();
/*  {
    img: '/img/湿度.png',
    name: '湿度',
    value: ' ',
    unit: 'RH',
}, {
    img: '/img/光照.png',
    name: '光照',
    value: ' ',
    unit: 'Lux',
}, {
    img: '/img/噪声.png',
    name: '噪声',
    value: ' ',
    unit: 'dB',
}, {
    img: '/img/PM2.5.png',
    name: 'PM2.5',
    value: ' ',
    unit: 'ug/m3',
}, {
    img: '/img/风速.png',
    name: '风速',
    value: ' ',
    unit: 'km/s',
}, {
    img: '/img/风向.png',
    name: '风向',
    value: ' ',
    unit: '风',
}, {
    img: '/img/降雨量.png',
    name: '降雨量',
    value: '',
    unit: 'mm',
} */
