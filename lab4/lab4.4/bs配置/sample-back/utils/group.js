/**
 * 数据分组 simple polyfill for Array.prototype.group
 * @author: Pt
 * @param attr:String 依据分组的属性
 * @param arr:Array 要分组的数组
 * @return result:Object
 */
function groupBy(attr, arr) {
    let result = {};
    for (let index in arr) {
        let item = arr[index];
        //记录元素在原始数组内的索引
        item.index=index;
        //记录分组属性值
        item[`${attr}`]=item[attr];
        if (!(`${item[attr]}` in result)) {
            result[`${item[attr]}`] = [];
            result[`${item[attr]}`].push(item);
        } else { //如果索引中已有依据字段
            result[`${item[attr]}`].push(item);
        }
    }
    return result;
}

function example() {
    const inventory = [
        { name: 'asparagus', type: 'vegetables', quantity: 5 },
        { name: 'bananas', type: 'fruit', quantity: 0 },
        { name: 'goat', type: 'meat', quantity: 23 },
        { name: 'cherries', type: 'fruit', quantity: 5 },
        { name: 'fish', type: 'meat', quantity: 22 }
    ];

    console.log(groupBy('type', inventory));

}

module.exports.groupBy = groupBy;