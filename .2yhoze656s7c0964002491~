/*
  Version: 1.000-dev
  Budjut, copyright (c) by Michael Schwartz
  Distributed under an MIT license: https://github.com/michaelsboost/Budjut/blob/gh-pages/LICENSE
  
  This is Budjut (https://michaelsboost.github.io/Budjut/), Budjut is an app that visually shows you your income and expenses. It also gives you tips on how you can save and what tools you can use to invest and save upon the difference. Did I mention it’s free and open source? So what are you waiting for? Check out Budjut today and see where your money is taking you.
*/

// variables
var version = '1.000', str, 
    income, incomeGroup,
    expenseGroups, expenseTotals,
    totalIncome, totalSpent,
    isChartRendered = false;

var budjutOBJ = {
  "version": version,
  "groups": [],
  "plannedGroups": [],
  "remainingGroups": [],
  "income": [],
  "incomeGroup": [],
  "incomeData": [],
  "spent": [],
  "groupsSpent": [],
  "transactions": []
};

// over budget color
// #f00
// left to budget color
// #797e83
// all money accounted for
// #49ce65

// Budjut about
$('[data-about]').click(function() {
  swal({
    html: '<img src="imgs/icon.svg" style="isolation:isolate; width: 50%; cursor: pointer;" viewBox="0 0 512 512" onclick="window.open(\'https://github.com/michaelsboost/Budjut\', \'_blank\')"><br><h1>Budjut</h1><h5>Version 1.000-dev</h5><a href="https://github.com/michaelsboost/Budjut/blob/gh-pages/LICENSE" target="_blank">Open Source License</a>'
  })
  $('.swal2-show').css('font-size', '14px')
  $('.swal2-show h1, .swal2-show h5').css({
    'font-weight': '100'
  })
})

// Coming soon
$('[data-comingsoon]').click(function() {
  alertify.log('coming soon...')
})

// render charts
function updateCharts() {
  // clear and refresh chart data
  $('[data-output=pie], [data-output=line], [data-output=pie2], [data-output=bar]').empty()
  $('[data-output=pie]').append('<canvas id="pie"></canvas>')
  $('[data-output=line]').append('<canvas id="line"></canvas>')
  $('[data-output=pie2]').append('<canvas id="pie2"></canvas>')
  $('[data-output=bar]').append('<canvas id="bar"></canvas>')

  // calculate transaction groups for charts
  expenseGroups = []
  expenseTotals = []

  budjutOBJ.transactions.forEach((transaction) => {
    var { category, amount } = transaction
    var index = expenseGroups.indexOf(category)

    if (index === -1) {
      expenseGroups.push(category)
      expenseTotals.push(Number(amount))
    } else {
      expenseTotals[index] += Number(amount)
    }
  })

  // convert to uppercase
  arr = expenseGroups
  var newArr = arr.map(element => {
    return element.toUpperCase()
  })
  expenseGroups = newArr
  budjutOBJ.groups = expenseGroups

  // expenses pie chart
  var expensesPieChart = new Chart(pie.getContext('2d'), {
    type: 'pie',
    data: {
      labels: expenseGroups,
      datasets: [{
        label: 'Total Expenses',
        data: expenseTotals,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(225, 50, 64)',
          'rgb(64, 159, 64)'
        ]
      }]
    },
    options: {
      responsive: true,
      animation: {
        onComplete: function() {
          isChartRendered = true
        }
      },
      tooltips: {
        enabled: true
      },
      legend: {
        position: 'top'
      },
      layout: {
        padding: {
          left: 0,
          right: 0
        }
      }
    }
  })

  // line chart
  var lineChart = new Chart(line.getContext('2d'), {
    type: 'line',
    data: {
      labels: expenseGroups,
      datasets: [{
        label: '',
        data: expenseTotals,
        fill: false,
        borderColor: '#2196f3', // Add custom color border
        backgroundColor: '#2196f3', // Add custom color background
        borderWidth: 1 // Specify bar border width
      }]
    },
    options: {
      responsive: true,
      animation: {
        onComplete: function() {
          isChartRendered = true
        }
      },
      tooltips: {
        enabled: true
      },
      legend: {
        display: false
      },
      layout: {
        padding: {
          left: 0,
          right: 0
        }
      }
    }
  })

  // calculate income groups for pie chart
  var incomeGroup = budjutOBJ.incomeGroup
  var income      = budjutOBJ.income

  var temp = {}
  incomeGroup.forEach((value, index) => {
    temp.hasOwnProperty(value) ? temp[value]+=parseInt(income[index]) : temp[value]=parseInt(income[index])
  })

  incomeGroup = Object.keys(temp)
  income = Object.values(temp)
  
  // convert to uppercase
  var arr = incomeGroup
  var newArr = arr.map(element => {
    return element.toUpperCase()
  })
  incomeGroup = newArr

  // income pie chart
  var incomePieChart = new Chart(pie2.getContext('2d'), {
    type: 'pie',
    data: {
      labels: incomeGroup,
      datasets: [{
        label: 'Income',
        data: income,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(225, 50, 64)',
          'rgb(64, 159, 64)'
        ]
      }]
    },
    options: {
      responsive: true,
      animation: {
        onComplete: function() {
          isChartRendered = true
        }
      },
      tooltips: {
        enabled: true
      },
      legend: {
        position: 'top'
      },
      layout: {
        padding: {
          left: 0,
          right: 0
        }
      }
    }
  })

  totalIncome = 0
  for(let numbers of budjutOBJ.income) {
    totalIncome += parseFloat(numbers)
  }

  totalSpent = 0
  var arr = budjutOBJ.spent.sort().reverse()
  for(let numbers of arr) {
    totalSpent += parseFloat(numbers)
  }

  // bar chart
  var barChart = new Chart(bar.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['INCOME', 'EXPENSES'],
      datasets: [{
        label: '',
        data: [totalIncome, totalSpent],
        fill: true,
        backgroundColor: [
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)'
        ]
      }]
    },
    options: {
      responsive: true,
      animation: {
        onComplete: function() {
          isChartRendered = true
        }
      },
      tooltips: {
        enabled: true
      },
      legend: {
        display: false
      },
      layout: {
        padding: {
          left: 0,
          right: 0
        }
      }
    }
  })
}
updateCharts()

var picker = MCDatepicker.create({
	el: '#date',
	showCalendarDisplay: false,
  dateFormat: 'MM-DD-YYYY'
})

// digital clock
function timeNow(value) {
  var clockNow = new Date()
  var clockStr = clockNow.toLocaleDateString()
  str = value
}
function renderDateStr() {
  var now = new Date()
  var month = now.getMonth() + 1
  var currentDate = now.getDate()
  var year = now.getFullYear()
  var dateStr = month + '/' + now + '/' + year
  // var dateStr = year + '-' + month + '-' + now
  // date.value = dateStr
  date.value = dateStr
}
// renderDateStr()
function renderDate(str) {
  var today = new Date()
  var day = today.getDay()
  var currentDate = today.getDate()
  var monthName = today.getMonth() + 1
  var year = today.getFullYear()
  var fullYear = monthName + '-' + currentDate + '-' + year
  // date.value = fullYear
  return str = fullYear
}
renderDate()
function headerDate() {
  var today = new Date()
  var day = today.getDay()
  var monthName = today.getMonth()
  var monthArray = new Array('January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
  var year = today.getFullYear()
  var fullYear = monthArray[monthName] + ' ' + year
  $('[data-budgetdate]').text(fullYear)
}
headerDate()
function monthTitle() {
  var today = new Date()
  var monthName = today.getMonth()
  var monthArray = new Array('January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
  $('[data-output=month]').text(monthArray[monthName])
}
monthTitle()
function renderFullDate() {
  var today = new Date()
  var day = today.getDay()
  var currentDate = today.getDate()
  var monthName = today.getMonth()
  var dayArray = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
  var monthArray = new Array('January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
  var year = today.getFullYear()
  // var fullYear = dateArray[day] + ',' + monthArray[monthName] + ' ' + currentDate + ', ' + year
  var fullYear = monthArray[monthName] + ' ' + currentDate + ', ' + year
  date.value = fullYear
}
// renderFullDate();

// handle pages
$('[data-openpage]').click(function() {
  // cancel operation if page is already active
  if ($(this).hasClass('active')) {
    return false
  }

  $('[data-openpage]').removeClass('active')
  $(this).addClass('active')
  $('[data-page]').hide()
  if ($(this).attr('data-openpage') === 'insights') {
    updateCharts()
  }
  $('[data-page='+ $(this).attr('data-openpage') +']').show()
})

// handle budget navigation
$('[data-nav]').click(function() {
  // cancel operation if page is already active
  if ($(this).hasClass('active')) {
    return false
  }

  $('[data-nav]').removeClass('active')
  $(this).addClass('active')
  $('[data-detectpage]').text(this.textContent)
  
  updateBudget()
})

// open dialog
$('[data-open=dialog]').click(function() {
  $('[data-dialog]').show();
})
// close dialog
$('[data-close=dialog]').click(function() {
  $('[data-dialog]').hide();
})

// income or expense
$('[data-incomeorexpense] button').click(function() {
  $('[data-incomeorexpense] button.active').removeClass('active')
  $(this).addClass('active')
  if (this.textContent === '+ income') {
    $('[data-transaction=category]').hide()
    $('[data-merchantorsource]').attr('data-merchantorsource', 'source').text('source')
  } else {
    $('[data-transaction=category]').show()
    $('[data-merchantorsource]').attr('data-merchantorsource', 'merchant').text('merchant')
  }
})
// trigger income and expense button onclick
$('[data-trigger="income"]').click(function() {
  $('[data-btn=income]').click();
})
$('[data-trigger="expense"]').click(function() {
  $('[data-btn=expense]').click();
})

// dynamic hyperlink
$('[data-href]').click(function() {
  var tempEl = '<a id="templink" href="'+ $(this).attr('data-href') +'" target="_blank"></a>'
  $(document.body).append(tempEl)
  templink.click()
  $('#templink').remove()
})