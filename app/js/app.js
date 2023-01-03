/*
  Version: 1.000-dev
  Budjut, copyright (c) by Michael Schwartz
  Distributed under an MIT license: https://github.com/michaelsboost/Budjut/blob/gh-pages/LICENSE
  
  This is Budjut (https://michaelsboost.github.io/Budjut/), Budjut is an app that visually shows you your income and expenses. It also gives you tips on how you can save and what tools you can use to invest and save upon the difference. Did I mention it’s free and open source? So what are you waiting for? Check out Budjut today and see where your money is taking you.
*/

// update transactions object
$('[data-add=category]').click(function() {
  swal(
    {
      title: 'New Category',
      input: 'text',
      inputPlaceholder: 'name',
      showCancelButton: true,
      showLoaderOnConfirm: true
    }).then((result) => {
      if (result.value) {
        budjutOBJ.groups.push(result.value)
        
        $('#categories').append('<option value="'+ result.value +'">'+ result.value +'</option>')
        $('#categories option[value=test]')[0].selected = true
        budjutOBJ.plannedGroups.push('0')
        budjutOBJ.remainingGroups.push('0')
        updateBudget()

        alertify.success('Successfully added category!')
        return false
      }
      return false
    }
  )
  return false
})

function updatePlannedAmount() {
  // first detect total income
  var sum1 = 0
  var sum2 = 0
  var arr = budjutOBJ.spent.sort().reverse()

  for(let numbers of budjutOBJ.income) {
    sum1 += parseFloat(numbers)
  }

  // next detect total spent
  for(let numbers of arr) {
    sum2 += parseFloat(numbers)
  }

  // detect if over budget
  if (sum2 > sum1) {
    $('[data-place=status] [data-status]').html('$' + parseFloat(sum2 - sum1).toFixed(2) + ' <font color="red">Over Budget</font>')
  }

  // detect if under budget
  if (sum1 > sum2) {
    $('[data-place=status] [data-status]').html('$' + parseFloat(sum1 - sum2).toFixed(2) + ' <font color="#666">Left to Budget</font>')
  }

  // detect if every dollar and cent is covered
  if (sum1 === sum2) {
    $('[data-place=status] [data-status]').text('😊 You\'ve covered every dollar! ✋')
  }
}

// update budget amount
function updateAmount(e) {
  var num = $(e).parent().parent().index()

  swal(
    {
      title: 'Planned amount',
      input: 'number',
      inputPlaceholder: 'integer',
      showCancelButton: true
    }).then((result) => {
      if (result.value) {
        e.textContent = result.value

        if ($('[data-nav].active').text() === 'planned') {
          // push budget plan for group
          budjutOBJ.plannedGroups[num] = result.value
        } else if ($('[data-nav].active').text() === 'remaining') {
          // push budget plan for group
          budjutOBJ.plannedGroups[num] = result.value
        }
        updateBudget()

        alertify.success('Successfully updated planned amount!')
        return false
      }
      return false
    }
  )
  return false
}

// delete income source
function deleteIncome(e) {
  swal(
    {
      title: "Are you sure you want to delete this source?",
      showCancelButton: true,
      showLoaderOnConfirm: true
    }).then((result) => {
      if (result.value) {
        var num = $(e).parent().index()
      
        // clear array
        budjutOBJ.income = []
        budjutOBJ.incomeGroup = []
        budjutOBJ.incomeData = []
        $(e).parent().remove()
        
        // reset array
        $('[data-place=income] li').each(function() {
          var date = $(this).attr('data-incomedate')
          var amount = $(this).attr('data-incomeamount')
          var name = $(this).attr('data-incomename')
          var notepad = $(this).attr('data-incomenote')
      
          budjutOBJ.income.push(amount)
          budjutOBJ.incomeGroup.push(name)
          budjutOBJ.incomeData.push({'date': date, 'amount': amount, 'name': name, 'notepad': notepad})
        })

        // update budget
        updateBudget()
        updateCharts()
        return false
      }
      return false
    }
  )
  return false
}

// delete transaction source
function deleteTransaction(e) {
  swal(
    {
      title: "Are you sure you want to delete this source?",
      showCancelButton: true,
      showLoaderOnConfirm: true
    }).then((result) => {
      if (result.value) {
        var num = $(e).parent().index()
      
        // clear array
        budjutOBJ.transactions = []
        budjutOBJ.spent = []
        budjutOBJ.groupsSpent = []
        $(e).remove()
        
        // reset array
        $('[data-output=transaction] li').each(function() {
          var date     = $(this).attr('data-transactiondate')
          var amount   = $(this).attr('data-transactionamount')
          var name     = $(this).attr('data-transactionname')
          var category = $(this).attr('data-transactioncategory')
          var notepad  = $(this).attr('data-transactionnote')
      
          budjutOBJ.transactions.push({'date': date, 'amount': amount, 'name': name, 'category': category, 'notepad': notepad})
          budjutOBJ.spent.push(amount)
          budjutOBJ.groupsSpent.push(category)
        })

        // $('[data-output=transaction] [data-incomedate]').remove()

        // update budget
        updateBudget()
        updateCharts()
        return false
      }
      return false
    }
  )
  return false
}

// update budget
function updateBudget() {
  // In javascript having keys with same name will override the previous one and it will take the latest keys valuepair defined by the user.
  
  var sum = 0
  var sum2 = 0
  var arr = budjutOBJ.spent.sort().reverse()

  if ($('[data-nav].active').text() === 'planned') {
    for(let numbers of budjutOBJ.income) {
      sum += parseFloat(numbers)
    }
    $('[data-income=total]').text(sum);

    // refresh categories with total planned for those categories
    setTimeout(function() {
      $('#categorieslist').empty()
      $.each(expenseGroups, function(i) {
        $('#categorieslist').append('<li><button class="fl">'+ expenseGroups[i].toLowerCase() +'</button><span class="fr"><button onclick="updateAmount(this)">'+ budjutOBJ.plannedGroups[i] +'</button></span></li>')
      })
    }, 100)
  } else if ($('[data-nav].active').text() === 'spent') {
    // show total amount of money spent
    for(let numbers of arr) {
      sum += parseFloat(numbers)
    }
    $('[data-income=total]').text(sum);

    // refresh categories with total spent in those categories
    setTimeout(function() {
      $('#categorieslist').empty()
      $.each(expenseGroups, function(i) {
        $('#categorieslist').append('<li><button class="fl">'+ expenseGroups[i].toLowerCase() +'</button><span class="fr"><button>'+ expenseTotals[i] +'</button></span></li>')
      })
    }, 100)
  } else if ($('[data-nav].active').text() === 'remaining') {
    for(let numbers of budjutOBJ.income) {
      sum += parseFloat(numbers)
    }
    for(let numbers of arr) {
      sum2 += parseFloat(numbers)
    }
    $('[data-income=total]').text(parseFloat(sum - parseFloat(sum2)))

    // refresh categories with total remaining for those categories
    setTimeout(function() {
      $('#categorieslist').empty()
      $.each(expenseGroups, function(i) {
        $('#categorieslist').append('<li><button class="fl">'+ expenseGroups[i].toLowerCase() +'</button><span class="fr"><button onclick="updateAmount(this)">'+ budjutOBJ.remainingGroups[i] +'</button></span></li>')
      })
    }, 100)
  } else {
    alertify.error('Error: Couldn\'t detect page!')
  }

  // empty income categories and transactions
  $('#categorieslist').empty()
  $('[data-output=transaction]').empty()
  $('[data-place=income]').empty();

  // refresh transactions
  for (i = 0; i < budjutOBJ.transactions.length; i++) {
    // var trimDate = budjutOBJ.transactions[i].date;
    //     trimDate = trimDate.substr(0, trimDate.length - 5)

    var transDate = budjutOBJ.transactions[i].date
    var transAmt  = budjutOBJ.transactions[i].amount
    var transName = budjutOBJ.transactions[i].name
    var transCate = budjutOBJ.transactions[i].category
    var transNote = budjutOBJ.transactions[i].notepad

    $('[data-output=transaction]').append('<li onclick="deleteTransaction(this)" data-transactiondate="'+ transDate +'" data-transactionamount="'+ transAmt +'" data-transactionname="'+ transName +'" data-transactioncategory="'+ transCate +'" data-transactionnote="'+ transNote +'"><button class="fl date">'+ transDate +'</button><span><span class="fr"><div class="expensecolor">-$'+ transAmt +'</div><div>'+ transName +'</div><div>'+ transCate +'</div></span></span></li>')
  }

  // refresh income
  for (i = 0; i < budjutOBJ.incomeData.length; i++) {
    $('[data-place=income]').append('<li data-incomedate="'+ budjutOBJ.incomeData[i].date +'" data-incomeamount="'+ budjutOBJ.incomeData[i].amount +'" data-incomename="'+ budjutOBJ.incomeData[i].name +'" data-incomenote="'+ budjutOBJ.incomeData[i].notepad +'"><button class="fl" onclick="deleteIncome(this)">'+ budjutOBJ.incomeData[i].name +'</button><span class="fr"><button>'+ budjutOBJ.incomeData[i].amount +'</button></span></li>')
    // $('[data-output=transaction]').append('<li data-incomedate="'+ budjutOBJ.incomeData[i].date +'" data-incomeamount="'+ budjutOBJ.incomeData[i].amount +'" data-incomename="'+ budjutOBJ.incomeData[i].name +'" data-incomenote="'+ budjutOBJ.incomeData[i].notepad +'"><button class="fl date">'+ budjutOBJ.incomeData[i].date +'</button><span><span class="fr"><div class="incomecolor">+$'+ budjutOBJ.incomeData[i].amount +'</div><div>'+ budjutOBJ.incomeData[i].name +'</div></span></span></li>')
  }

  updatePlannedAmount()

  // remember budget in localStorage
  if (!localStorage.getItem('budgetStorage')) {
    localStorage.setItem('budgetStorage', JSON.stringify(budjutOBJ))
  } else {
    // localStorage.setItem('budgetStorage', JSON.stringify(budjutOBJ))
  }
}

// transaction function
function Transaction(date, amount, name, category, notepad) {
  this.date = date
  this.amount = amount
  this.name = name
  this.category = category
  this.notepad = notepad

  budjutOBJ.spent.push(amount)
  // budjutOBJ.groupsSpent.push(amount)
  budjutOBJ.transactions.push({'date': date, 'amount': amount, 'name': name, 'category': category, 'notepad': notepad})

  // update charts
  updateCharts()

  // if planned groups is null push zeros
  $.each(budjutOBJ.groups, function(i) {
    (!budjutOBJ.plannedGroups) ? '' : budjutOBJ.plannedGroups.push(0)
  })

  // if remaining groups is null push zeros
  $.each(budjutOBJ.groups, function(i) {
    (!budjutOBJ.remainingGroups) ? '' : budjutOBJ.remainingGroups.push(0)
  })
}

// income function
function Income(date, amount, name, notepad) {
  this.date = date
  this.amount = amount
  this.name = name
  this.notepad = notepad

  budjutOBJ.income.push(amount)
  budjutOBJ.incomeGroup.push(name)
  budjutOBJ.incomeData.push({'date': date, 'amount': amount, 'name': name, 'notepad': notepad})
}

// add transaction
$('[data-add=transaction]').click(function() {
  // detect if transaction is income
  if ($('[data-btn=income]').hasClass('active')) {
    // push income
    if (!date.value || !amount.value || !merchant.value) {
      alertify.error('Error: Missing date, amount and/or Merchant!')
    } else {
      var income = new Income(date.value, amount.value, merchant.value, notepad.value)

      // notify user expense was successful
      alertify.success('Successfully added income!')
    }

    // close income/expense dialog
    $('[data-dialog]').hide()
  }

  // detect if transaction is an expense
  if ($('[data-btn=expense]').hasClass('active')) {
    // push expense
    if (!date.value || !amount.value || !merchant.value) {
      alertify.error('Error: Missing date, amount and/or source!')
    } else {
      var transaction = new Transaction(date.value, amount.value, merchant.value, categories.value, notepad.value)

      // notify user expense was successful
      alertify.success('Successfully added expense!')
    }

    // close income/expense dialog
    $('[data-dialog]').hide()
  }

  // update budget
  updateBudget()
})

// bot
// var transaction = new Transaction('1-1-2023', '850', 'rent', 'housing', '');
// var transaction = new Transaction('1-1-2023', '330.25', 'gas', 'housing', '');
// var transaction = new Transaction('1-1-2023', '91', 'electric', 'housing', '');
// var transaction = new Transaction('1-1-2023', '50', 'car insurance', 'transportation', '');

// var income = new Income('1-1-2023', '561.25', 'ups', '');
// var income = new Income('1-1-2023', '250', 'ups', '');
// var income = new Income('1-1-2023', '250', 'ups', '');
// var income = new Income('1-1-2023', '250', 'ups', '');
// var income = new Income('1-1-2023', '10', 'udemy', '');

// initialize budget
if (localStorage.getItem('budgetStorage')) {
  budjutOBJ = JSON.parse(localStorage.getItem('budgetStorage'))
}
updateBudget()