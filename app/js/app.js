// variables
var headerHeight = 0,
    scroll       = 0,
    counter      = 1,
    ctx          = pie.getContext('2d'),
    isChartRendered = false;

// generate date
var now         = new Date();
var month       = now.getMonth() + 1;
var currentDate = now.getDate();
var year        = now.getFullYear();
var todaysDate  = month + '/' + currentDate + '/' + year;
var fileName = todaysDate.replace(/ /g, '-');

// scroll to top
window.scrollTo({ top: 0 });

// responsiveness
$(window).on('load resize', function() {
  if (document.body.clientWidth < 600) {
    $('.grid3, .grid4').removeClass('ib');
    $('.grid3, .grid4').addClass('wauto');
  } else {
    $('.grid3, .grid4').removeClass('wauto');
    $('.grid3, .grid4').addClass('ib');
  }
});

// save to localStorage
function setStorage() {
  // housing expenses
  localStorage.setItem('housing1', $('#answer-1')[0].value)
  localStorage.setItem('housing2', $('#answer-2')[0].value)
  localStorage.setItem('housing3', $('#answer-3')[0].value)
  localStorage.setItem('housing4', $('#answer-4')[0].value)
  localStorage.setItem('housing5', $('#answer-5')[0].value)
  localStorage.setItem('housing6', $('#answer-6')[0].value)
  localStorage.setItem('housing7', $('#answer-7')[0].value)

  // living expenses
  localStorage.setItem('living1', $('#answer-8')[0].value)
  localStorage.setItem('living2', $('#answer-9')[0].value)
  localStorage.setItem('living3', $('#answer-10')[0].value)
  localStorage.setItem('living4', $('#answer-11')[0].value)
  localStorage.setItem('living5', $('#answer-12')[0].value)
  localStorage.setItem('living6', $('#answer-13')[0].value)
  localStorage.setItem('living7', $('#answer-14')[0].value)

  // transportation expenses
  localStorage.setItem('transportation1', $('#answer-15')[0].value)
  localStorage.setItem('transportation2', $('#answer-16')[0].value)
  localStorage.setItem('transportation3', $('#answer-17')[0].value)
  localStorage.setItem('transportation4', $('#answer-18')[0].value)
  localStorage.setItem('transportation5', $('#answer-19')[0].value)
  localStorage.setItem('transportation6', $('#answer-20')[0].value)

  // misc expenses
  localStorage.setItem('misc1', $('#answer-21')[0].value)
  localStorage.setItem('misc2', $('#answer-22')[0].value)
  localStorage.setItem('misc3', $('#answer-23')[0].value)
  localStorage.setItem('misc4', $('#answer-24')[0].value)
  localStorage.setItem('misc5', $('#answer-25')[0].value)
  localStorage.setItem('misc6', $('#answer-26')[0].value)
  localStorage.setItem('misc7', $('#answer-27')[0].value)
  localStorage.setItem('misc8', $('#answer-28')[0].value)

  // savings and insurance expenses
  localStorage.setItem('savings1', $('#answer-29')[0].value)
  localStorage.setItem('savings2', $('#answer-30')[0].value)
  localStorage.setItem('savings3', $('#answer-31')[0].value)
  localStorage.setItem('savings4', $('#answer-32')[0].value)
  localStorage.setItem('savings5', $('#answer-33')[0].value)
  localStorage.setItem('savings6', $('#answer-34')[0].value)
  localStorage.setItem('savings7', $('#answer-35')[0].value)
  localStorage.setItem('savings8', $('#answer-36')[0].value)
}
function populateStorage() {
  // housing expenses
  $('#answer-1')[0].value = localStorage.getItem('housing1')
  $('#answer-2')[0].value = localStorage.getItem('housing2')
  $('#answer-3')[0].value = localStorage.getItem('housing3')
  $('#answer-4')[0].value = localStorage.getItem('housing4')
  $('#answer-5')[0].value = localStorage.getItem('housing5')
  $('#answer-6')[0].value = localStorage.getItem('housing6')
  $('#answer-7')[0].value = localStorage.getItem('housing7')

  // living expenses
  $('#answer-8')[0].value = localStorage.getItem('living1')
  $('#answer-9')[0].value = localStorage.getItem('living2')
  $('#answer-10')[0].value = localStorage.getItem('living3')
  $('#answer-11')[0].value = localStorage.getItem('living4')
  $('#answer-12')[0].value = localStorage.getItem('living5')
  $('#answer-13')[0].value = localStorage.getItem('living6')
  $('#answer-14')[0].value = localStorage.getItem('living7')

  // transportation expenses
  $('#answer-15')[0].value = localStorage.getItem('transportation1')
  $('#answer-16')[0].value = localStorage.getItem('transportation2')
  $('#answer-17')[0].value = localStorage.getItem('transportation3')
  $('#answer-18')[0].value = localStorage.getItem('transportation4')
  $('#answer-19')[0].value = localStorage.getItem('transportation5')
  $('#answer-20')[0].value = localStorage.getItem('transportation6')

  // misc expenses
  $('#answer-21')[0].value = localStorage.getItem('misc1')
  $('#answer-22')[0].value = localStorage.getItem('misc2')
  $('#answer-23')[0].value = localStorage.getItem('misc3')
  $('#answer-24')[0].value = localStorage.getItem('misc4')
  $('#answer-25')[0].value = localStorage.getItem('misc5')
  $('#answer-26')[0].value = localStorage.getItem('misc6')
  $('#answer-27')[0].value = localStorage.getItem('misc7')
  $('#answer-28')[0].value = localStorage.getItem('misc8')

  // savings and insurance expenses
  $('#answer-29')[0].value = localStorage.getItem('savings1')
  $('#answer-30')[0].value = localStorage.getItem('savings2')
  $('#answer-31')[0].value = localStorage.getItem('savings3')
  $('#answer-32')[0].value = localStorage.getItem('savings4')
  $('#answer-33')[0].value = localStorage.getItem('savings5')
  $('#answer-34')[0].value = localStorage.getItem('savings6')
  $('#answer-35')[0].value = localStorage.getItem('savings7')
  $('#answer-36')[0].value = localStorage.getItem('savings8')

  // trigger chart update
  setTimeout(function() {
    $('#answer-20').trigger('keyup');
  }, 300);
}

// first focus
function focus(el) {
  el.focus();
  if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body.createTextRange != 'undefined') {
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
  document.execCommand('selectAll', false, null);
}
// focus(grossincome);
grossincome.focus();

// income
grossincome.onkeyup = function() {
  localStorage.setItem('income', grossincome.value)
}
grossincome.value = localStorage.getItem('income');
populateStorage();

$('#income .answer').on('keydown', function(e) {
  if (e.which === 13) {
    if (!this.value.replace(/ /g, '')) {
      alertify.error('Oops - Answer cannot be empty!');
      return false;
    } else {
      this.value = eval(this.value);
      moneyleft.value = this.value;
//      $('#income').fadeOut();
      $('#expenses').fadeIn().find('.question').hide().first().addClass('selected').fadeIn();
      $('#expenses .answer').eq(0).focus();
  
      setTimeout(function() {
        window.scrollTo({ top: 0 });
        window.scrollTo({ top: window.innerHeight });
      }, 150)
      e.preventDefault();
    }
    e.preventDefault();
  }
});
$('#income .answer').on('keyup', function() {
  $('#answer-1').trigger('keyup');
});
$('#expenses .answer').on('keydown', function(e) {
  if (e.which === 13) {
    if (!$(this).hasClass('last')) {
      if ($(this).next().is('p')) {
        $(this).next().next().next('input').focus();
      } else {
        $(this).next('input').focus();
      }
    } else {
      // initialize next page
    }
    e.preventDefault();
  }
});
$('#expenses .answer').on('keyup', function() {
  // adds up housing expenses
  $('#housing').val( parseInt( parseInt($('#answer-1').val()) + parseInt($('#answer-2').val()) + parseInt($('#answer-3').val()) + parseInt($('#answer-4').val()) + parseInt($('#answer-5').val()) + parseInt($('#answer-6').val()) + parseInt($('#answer-7').val()) ) );
  // adds up living expenses
  $('#living').val( parseInt( parseInt($('#answer-8').val()) + parseInt($('#answer-9').val()) + parseInt($('#answer-10').val()) + parseInt($('#answer-11').val()) + parseInt($('#answer-12').val()) + parseInt($('#answer-13').val()) + parseInt($('#answer-14').val()) ) );
  // adds up transportation expenses
  $('#transportation').val( parseInt( parseInt($('#answer-15').val()) + parseInt($('#answer-16').val()) + parseInt($('#answer-17').val()) + parseInt($('#answer-18').val()) + parseInt($('#answer-19').val()) + parseInt($('#answer-20').val()) ) );
  // adds up miscellaneous expenses
  $('#misc').val( parseInt( parseInt($('#answer-21').val()) + parseInt($('#answer-22').val()) + parseInt($('#answer-23').val()) + parseInt($('#answer-24').val()) + parseInt($('#answer-25').val()) + parseInt($('#answer-26').val()) + parseInt($('#answer-27').val()) + parseInt($('#answer-28').val()) ) );
  // adds up savings and insurance expenses
  $('#savings').val( parseInt( parseInt($('#answer-29').val()) + parseInt($('#answer-30').val()) + parseInt($('#answer-31').val()) + parseInt($('#answer-32').val()) + parseInt($('#answer-33').val()) + parseInt($('#answer-34').val()) + parseInt($('#answer-35').val()) + parseInt($('#answer-36').val()) ) );
  
  // adds up all expenses
  $('#totalexpenses').val( parseInt( parseInt($('#housing').val()) + parseInt($('#living').val()) + parseInt($('#transportation').val()) + parseInt($('#misc').val()) + parseInt($('#savings').val()) ) );
  $('#moneyleft').val( parseInt( parseInt($('#grossincome').val()) - parseInt($('#totalexpenses').val()) ) );
    
  // update graphs
  var housingPerc = parseInt( parseInt(housing.value) / parseInt(grossincome.value) * 100);
  var livingPerc = parseInt( parseInt(living.value) / parseInt(grossincome.value) * 100);
  var transportationPerc = parseInt( parseInt(transportation.value) / parseInt(grossincome.value) * 100);
  var miscPerc = parseInt( parseInt(misc.value) / parseInt(grossincome.value) * 100);
  var savingsPerc = parseInt( parseInt(savings.value) / parseInt(grossincome.value) * 100);
  var leftoverPerc = parseInt( parseInt(moneyleft.value) / parseInt(grossincome.value) * 100);
  var totalPerc = parseInt( parseInt(totalexpenses.value) / parseInt(grossincome.value) * 100);
  
  $('.housingperc').attr('data-percent', housingPerc).data('easyPieChart').update(housingPerc);
  $('.livingperc').attr('data-percent', livingPerc).data('easyPieChart').update(livingPerc);
  $('.transportationperc').attr('data-percent', transportationPerc).data('easyPieChart').update(transportationPerc);
  $('.miscperc').attr('data-percent', miscPerc).data('easyPieChart').update(miscPerc);
  $('.savingsperc').attr('data-percent', savingsPerc).data('easyPieChart').update(savingsPerc);
  $('.leftoverperc').attr('data-percent', leftoverPerc).data('easyPieChart').update(leftoverPerc);
  $('.totalperc').attr('data-percent', totalPerc).data('easyPieChart').update(totalPerc);

  // pie chart data
  // sum of values = 360
  var housingPerc2 = parseInt( parseInt(housing.value) / parseInt(grossincome.value) * 360);
  var livingPerc2 = parseInt( parseInt(living.value) / parseInt(grossincome.value) * 360);
  var transportationPerc2 = parseInt( parseInt(transportation.value) / parseInt(grossincome.value) * 360);
  var miscPerc2 = parseInt( parseInt(misc.value) / parseInt(grossincome.value) * 360);
  var savingsPerc2 = parseInt( parseInt(savings.value) / parseInt(grossincome.value) * 360);
  var leftoverPerc2 = parseInt( parseInt(moneyleft.value) / parseInt(grossincome.value) * 360);
  var totalPerc2 = parseInt( parseInt(totalexpenses.value) / parseInt(grossincome.value) * 360);

  setStorage();

  var pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['HOUSING', 'LIVING', 'TRANSPORTATION', 'MISCELLANEOUS', 'SAVINGS & INSURANCE', 'TOTAL LEFT OVER'],
        datasets: [{
          label: vispercent.textContent,
          data: [housingPerc2, livingPerc2, transportationPerc2, miscPerc2, savingsPerc2, leftoverPerc2],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 206, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',
            'rgb(255, 159, 64)'
          ]
        }]
      },
      options: {
        responsive: true,
        animation: {
          onComplete: function() {
            isChartRendered = true;
          }
        },
        tooltips: {
          enabled: false
        },
        legend: {
          position: 'bottom'
        },
        layout: {
          padding: {
            left: 0,
            right: 0
          }
        }
      }
  });
});

// initialize graphs
$('#graphs .chart').easyPieChart({
  easing: 'easeOutBounce',
  onStep: function(from, to, percent) {
    $(this.el).find('.percent').text(Math.round(percent));
  }
});
var chart = window.chart = $('.chart').data('easyPieChart');

function testFill() {
  grossincome.value = 720;
  $('#income').show();
  $('#expenses').show();
  $('#expenses .question').hide();
  $('#expenses .question:first-child').show();
  $('#expenses .answer:first').focus();
  $('#answer-1').val('400');
  $('#answer-5').val('65');
  $('#answer-8').val('50');
  $('#answer-10').val('8');
  $('#answer-11').val('20');
  $('#answer-20').val('60').trigger('keyup');
  $('#showgraphs').trigger('click');
}
//testFill();

// save files
function exportPNG() {
  var getScroll = scroll;
  window.scrollTo({ top: 0 });
  document.body.style.width = '800px';
  $(".chart-container").attr('style', 'position: relative; left: 50%; width: 720px; margin-left: -360px;');
  $(window).trigger('resize');
  
  setTimeout(function() {
    // convert website object to image
    html2canvas(graphscrollpage, {
        allowTaint: true,
        useCORS: true,
        foreignObjectRendering: true
    }).then(function(canvas) {
        // download canvas image
        myBase64 = canvas.toDataURL("image/png");
        var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        if (iOS === true) {
            // remove image if already visible
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.id = "getshot";
            img.src = myBase64;
            document.body.appendChild(img);

            var a = document.createElement("a");
            a.href = getshot.src;
            a.download = fileName + ".png";
            a.click();
            document.body.removeChild(img);
        } else {
            canvas.toBlob(function(blob) {
              saveAs(blob, fileName + ".png");
            }, "image/png");
        }
      
        document.body.style.width = '';
        $(".chart-container").attr('style', 'position: relative; left: 50%; width: 90vw; margin-left: -45vw;');
        $(window).trigger('resize');
        window.scrollTo({ top: getScroll });
    });
  }, 150);
};
function getProjectJSON() {
  projectJSON = {
    "income"  : grossincome.value,
    "expenses": []
  }
  
  $("#expenses input").each(function() {
    projectJSON.expenses.push({
      "expense": $(this).val()
    });
  });
};

exportBudget.onclick = function() {
  exportPNG();
};