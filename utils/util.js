//判断是否为纯粹对象
function isPlainObject(obj) {
  if (!obj || obj.toString() !== "[object Object]" || obj.nodeType || obj.setInterval) {
    return false;
  }
  if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
    return false;
  }
  for (let key in obj) { }
  return key === undefined || obj.hasOwnProperty(key);
}

function colorLessons (lessons) {
  const colorArr = ['red', 'yellow', 'purple', 'blue', 'green']
  const colorMap = {}

  function getRandomValue (array) {
    const index = Math.floor((Math.random() * array.length))
    return array[index]
  }

  function getMinColor () {
    let min = 99
    let minColor = 'red'
    let hasMultipleMin = false
    for (let color in colorMap) {
      if (colorMap[color] < min) {
        min = colorMap[color]
        minColor = color
      }
    }
    for (let color in colorMap) {
      if (colorMap[color] === min) {
        hasMultipleMin = true
      }
    }
    if (hasMultipleMin) {
      return getRandomValue(colorArr)
    }
    return minColor
  }

  function getTopLessons (dayLessons, jie) {
    jie--
    while (jie >= 0) {
      if (dayLessons[jie].length > 0) {
        return dayLessons[jie]
      }
      jie--
    }
    return []
  }

  function getColor (usedColors) {
    const colorArray = Array.from(colorArr)

    for (let i = 0; i < colorArray.length; i++) {
      let color = colorArray[i]
      if (usedColors[color] === 1) {
        const colorIndex = colorArray.indexOf(color)
        colorArray.splice(colorIndex, 1)
      }
    }
    if (colorArray.length < 1) {
      return getMinColor()
    } else {
      return getRandomValue(colorArray)
    }
  }

  const lessonMap = {}

  // 每天的课程
  lessons.forEach((dayLessons, weekday) => {
    // 每节的课程们
    dayLessons.forEach((lessonsBlock, jie) => {
      // 每个课程
      lessonsBlock.forEach((item) => {
        if (lessonMap[item['id']]) {
          item['颜色'] = lessonMap[item['id']]
        } else {
          const topLessons = getTopLessons(dayLessons, jie)
          const leftLessons = (lessons[weekday - 1] || [])[jie] || []
          const bottomLessons = dayLessons[jie + 2] || []
          const rightLessons = (lessons[weekday - 1] || [])[jie] || []
          const usedColors = {}
          topLessons.forEach((lesson) => {
            if (lesson['颜色']) {
              usedColors[lesson['颜色']] = 1
            }
          })
          leftLessons.forEach((lesson) => {
            if (lesson['颜色']) {
              usedColors[lesson['颜色']] = 1
            }
          })
          bottomLessons.forEach((lesson) => {
            if (lessonMap[lesson['id']]) {
              usedColors[lessonMap[lesson['id']]] = 1
            }
          })
          rightLessons.forEach((lesson) => {
            if (lessonMap[lesson['id']]) {
              usedColors[lessonMap[lesson['id']]] = 1
            }
          })
          item['颜色'] = getColor(usedColors)
          lessonMap[item['id']] = item['颜色']
          if (colorMap[item['颜色']] !== undefined) {
            colorMap[item['颜色']] = 0
          }
          colorMap[item['颜色']]++
        }
      })
    })
  })

  return lessons
}

module.exports = {
  formatTime(date) {
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()

    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },
  deepClone(obj) {
    if (!isPlainObject(obj)) { return false; }
    return JSON.parse(JSON.stringify(obj));
  },
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  /**
   * 处理课表数据以便DOM渲染
   * @param classResult
   * @returns {Array}
   */
  fixTimetable(classResult) {
    if (!classResult) {
      return []
    }

    const classList = classResult['list'] || []
    const lessons = []
    for (let i = 0; i < 7; i++) {
      lessons[i] = []
      for (let j = 0; j < 12; j++) {
        lessons[i][j] = []
      }
    }

    classList.forEach((item, index) => {
      const infoList = item['信息'] || []
      infoList.forEach((info) => {
        const lesson = {};
        Object.assign(lesson, info)
        lesson['id'] = index + 1
        lesson['周'] = []
        lesson['地点'] = info['地点']
        lesson['学分修正'] = (+item['学分']).toFixed(1)
        const englishArr = info['地点'].match(/[0-9a-zA-Z:]/g) || []
        lesson['地点长度'] = info['地点'].length * 2 - englishArr.length
        const nameArr = item['课程名称'].match(/[0-9a-zA-Z:]/g) || []
        lesson['课程名称长度'] = item['课程名称'].length - nameArr.length / 1.2
        lesson['节数'] = info['结束节'] - info['开始节'] + 1
        lesson['起止周'] = info['开始周'] + '-' + info['结束周']
        lesson['起止节'] = info['开始节'] + '-' + info['结束节']

        const type = info['周类型'] || 'default'

        for(let i = 1; i <= 18; i++) {
          if (type === 'odd' || type === 'even') {
            if (type === 'odd') {
              lesson['周'][i] = (i >= info['开始周'] && i <= info['结束周']) && ((i + 1) % 2 === 0)
            } else {
              lesson['周'][i] = (i >= info['开始周'] && i <= info['结束周']) && (i % 2 === 0)
            }
          } else {
            lesson['周'][i] = (i >= info['开始周'] && i <= info['结束周'])
          }
        }
        const jie = info['开始节'] - 1
        lessons[parseInt(info['星期']) - 1][jie].push(Object.assign({}, item, lesson))
      })
    })

    return colorLessons(lessons)
  },
  /**
   * 计算今日课表
   * @param {Array} data
   * @returns {Array}
   */
  fixTimetableToday (data) {
    if (!data || Array.isArray(data)) {
      return []
    }
    const weekday = (new Date()).getDay()
    const todayData = data[weekday]
    return data
  },
  fixAppList (list) {
    return list.map((item) => {
      item.bg = '../../images/app-list/' + item.bg +'.png'
      return item
    })
  },
  fixIcons (icons) {
    for (let key in icons) {
      icons[key].bg = '../../images/app-list/' + icons[key].bg +'.png'
    }
    return icons
  },
  fixScore (scoreData) {
    const list = scoreData.list
    list.forEach((item) => {
      item['真实成绩'] = this.getTrueScore(item['成绩'])
    })
    return scoreData
  },
  fixExam (examData) {
    const list = examData.list
    list.sort((a, b) => {
      let tempA = a['倒计时'] < 0 ? -a['倒计时'] + 99 : a['倒计时']
      let tempB = b['倒计时'] < 0 ? -b['倒计时'] + 99 : b['倒计时']
      return tempA - tempB
    })
    return examData
  },
  fixCard (cardData) {
    const list = cardData['今日账单']
    list.reverse()
    function getTrueBalance (list, index) {
      if (list[index]['卡余额'] !== 'N/A') {
        return list[index]['卡余额'] - (+list[index]['交易额'])
      } else {
        if (index - 1 < 0) {
          return +cardData['卡余额']
        }
        return getTrueBalance(list, index - 1) - (+list[index]['交易额'])
      }
    }
    list.forEach((item, index) => {
      item['商户'] = item['商户'].trim()
      if (item['卡余额'] === 'N/A') {
        item['卡余额'] = getTrueBalance(list, index).toFixed(2)
      }
    })
    list.reverse()
    return cardData
  },
  fixCardCost (cardData) {
    const cardRecords = cardData['今日账单']
    const records = cardRecords.map((item) => -item['交易额']).filter((item) => item > 0)
    const total = (records.reduce((sum, item) => {
      return +sum + item * 100
    }, 0)) / 100
    const iStyle = `font-style: normal;font-size: 26rpx;color: #777;font-weight: normal;`
    const totalStyle = `color: #ffbf92;font-weight: bold;`
    return {
      total: total,
      cost: records,
      text: records.map(item => `<i style="${iStyle}">${item}</i>`).join(' + ') + ' = ' + `<i style="${iStyle}${totalStyle}">${total}</i>`
    }
  },
  fixTeacher (teacherData) {
    const wd = teacherData.wd
    const list = teacherData.list
    if (!wd) {
      return teacherData
    }
    list.forEach((item) => {
      const nameArr = item.name.split(new RegExp(wd, 'g')).map((item) => {
        return JSON.stringify({
          active: false,
          value: item
        })
      })
      const str = '[' + nameArr.join(JSON.stringify({
        active: true,
        value: wd
      })).split('}{').join('},{') + ']'

      item.nameArr = JSON.parse(str)
    })
    return teacherData
  },
  fixFreeroom (freeroomData) {
    const list = freeroomData.list
    const roomMap = {}

    list.forEach((item) => {
      const buildName = item['区域名称']
      if (!roomMap[buildName]) {
        roomMap[buildName] = {}
      }
      if (!roomMap[buildName].list) {
        roomMap[buildName].list = []
      }
      item['disabled'] = !!(item['使用部门'] || item['使用班级'])
      roomMap[buildName].iconText = buildName.slice(0, 1)
      roomMap[buildName].list.push(item)
    })
    for(let build in roomMap) {
      roomMap[build].list.sort((a, b) => {
        return b['容量'] - a['容量']
      })
    }
    return roomMap
  },
  getTrueScore (scoreString) {
    if (isNaN(scoreString)) {
      switch(scoreString) {
        case '优秀':
          return 95
        case '良好':
          return 85
        case '中等':
          return 75
          break;
        case '及格':
          return 65
        case '通过':
          return 60
        default:
          return 0
      }
    } else {
      if (scoreString <= 5 && scoreString > 0) {
        return (scoreString + 5) * 10
      }
      return +scoreString
    }
  }
}
