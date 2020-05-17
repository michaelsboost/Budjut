// variables
var headerHeight = 0,
    scroll       = 0,
    counter      = 1,
    ctx          = pie.getContext('2d'),
    isChartRendered = false,
    loadedJSON = [];

// generate date
var now         = new Date();
var month       = now.getMonth() + 1;
var currentDate = now.getDate();
var year        = now.getFullYear();
var todaysDate  = month + '/' + currentDate + '/' + year;

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
  headerHeight = parseInt(parseInt($('#top').css('height').replace(/px/, '')) + parseInt($('#expenses').css('height').replace(/px/, '')));
  
  $('.mask').css('height', headerHeight);
});

// get window scroll position
window.addEventListener("scroll", function(e) {
  scroll = this.scrollY;
  headerHeight = parseInt(parseInt($('#top').css('height').replace(/px/, '')) + parseInt($('#expenses').css('height').replace(/px/, '')));
  
  $('.mask').css('height', headerHeight - scroll);
});

// menubar
$('.bars').on('click', function() {
  $('#menu, #bars').fadeToggle();
});

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
focus(username);

username.onkeydown = function(e) {
  if (e.which === 13) {
    if (!this.textContent.replace(/ /g, '')) {
      alertify.error(nameError);
      return false;
    }
    $(this).fadeOut();
    $('#goals').fadeIn().find('.question').hide().first().addClass('selected').fadeIn();
    focus($('#goals .answer')[0]);
    e.preventDefault();
  }
}
$('#goals .answer').on('keydown', function(e) {
  if (e.which === 13) {
    if (!this.textContent.replace(/ /g, '')) {
      alertify.error(emptyAnswer);
      return false;
    } else if ($('.selected').is(':last-child')) {
      $('.selected').removeClass('selected');
      $('#goals').fadeOut();
      $('#income').fadeIn().find('.question').hide().first().addClass('selected').fadeIn();
      $('#income .answer').eq(0).focus();
      counter = 1;
      e.preventDefault();
    } else {
      var count = counter++;
      $('#goals .question').hide().removeClass('selected').eq(count).addClass('selected').fadeIn();
      $('#goals .answer').eq(count).fadeIn();
      focus($('#goals .answer')[count]);
    }
    e.preventDefault();
  }
});
$('#income .answer').on('keydown', function(e) {
  if (e.which === 13) {
    if (!this.value.replace(/ /g, '')) {
      alertify.error('Oops - Answer cannot be empty!');
      return false;
    } else {
      this.value = eval(this.value);
      mirrorgross.textContent = this.value;
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
  
  // mirror all expenses to hidden table
  $('#expense-table .mirroranswer').each(function(i) {
    this.textContent = parseInt(parseInt($('#expenses .answer')[i].value) * 12)
  });
  mirrorgross.textContent = parseInt( parseInt(grossincome.value) * 12 );
  mirrorexpenses.textContent = parseInt( parseInt(totalexpenses.value) * 12 );
  mirrorleftover.textContent = parseInt( parseInt(moneyleft.value) * 12 );
  
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

  var pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [housingStr, livingStr, transportationStr, miscStr, savingsStr, totalexpensesleftoverStr],
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
$('#showgraphs').click(function() {
  window.scrollTo({ top: document.body.scrollHeight });
  $(this).slideUp(250);
  $('#graphscrollpage, #lifestylechanges, #investingdifference, #buyordiy').slideDown(250);
  setTimeout(function() {
    window.scrollTo({ top: headerHeight });
    $('.mask').css('height', 0);
  }, 250);
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
  username.textContent = 'Adam Smith';
  $('#username').hide();
  $('#goals .answer').text('Lorem ipsum dolor sit amet, consectetur adipisicing elit. Distinctio cum perspiciatis iusto facilis aliquam iure ipsum consequatur laudantium, corrupti perferendis quisquam voluptatibus aspernatur eos minima non, culpa sapiente? Libero, illo.');
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
function exportPDF() {
  var w = graphs.offsetWidth;
  var h = graphs.offsetHeight;
  var getScroll = scroll;
  $(document.body).append('<div class="snapshot"><div class="loading"><div class="red"></div><div class="blue"></div><div class="yellow"></div><div class="green"></div></div></div>');
  document.body.style.width = '800px';
  $(".chart-container").attr('style', 'position: relative; left: 50%; width: 720px; margin-left: -360px;');
  $(window).trigger('resize');
  window.scrollTo({ top: 0 });
  setTimeout(function() {
    html2canvas(graphs, {
//    dpi: 300, // Set to 300 DPI
//    scale: 3, // Adjusts your resolution
    onrendered: function(canvas) {
      var img = canvas.toDataURL('image/jpeg', 1);
//      var doc = new jsPDF('L', 'px', [w, h]);
      var doc = new jsPDF();
      var specialElementHandlers = {
        '#bypassme': function (element, renderer) {
          return true;
        }
      };
      doc.setFillColor(0, 0, 255);
      doc.triangle(0, 0, 210, 0, 100, 250, 'F');

      doc.setFontSize(80);
      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#ffffff');
      doc.text(100, 50, 'Budjut', 'center');

      doc.setFontSize(20);
      doc.setTextColor('#333333');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 270, nameSpot + ': ' + username.textContent);
      doc.text(15, 280, dateSpot + ': ' + todaysDate);
      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);

      doc.addPage();
      doc.setFontSize(20);
      doc.setTextColor('#0000ff');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 25, page1Title);
      
      doc.fromHTML(goals.innerHTML, 15, 35, {
        'width': 170,
        'elementHandlers': specialElementHandlers
      });
      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);
      doc.addPage();

      doc.setFontSize(20);
      doc.setTextColor('#0000ff');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 25, page2Title);

      doc.autoTable({
        margin: { top: 35 },
        html: '#expense-table',
        theme: 'plain',
        useCss: false,
        columnStyles: { 0: {
          halign: 'left',
          fillColor: [230, 231, 233]
        }},
        headStyles: {
          fontSize: 15,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        }
      });

      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);
      doc.addPage();

      doc.setFontSize(20);
      doc.setTextColor('#0000ff');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 25, page3Title);
      
      var divHeight = $('#graphs').height();
      var divWidth = $('#graphs').width();
      var ratio = divHeight / divWidth;
      var width = doc.internal.pageSize.getWidth();
      var height = doc.internal.pageSize.getHeight();
      height = ratio * width;
      doc.addImage(img, 'JPEG', 0, 35, width, height);

      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);
      doc.addPage();

      doc.setFontSize(20);
      doc.setTextColor('#0000ff');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 25, page4Title);
      
      doc.fromHTML($('#lifestylechangesTxt')[0].innerHTML, 15, 35, {
        'width': 170,
        'elementHandlers': specialElementHandlers
      });

      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);
      doc.addPage();

      doc.setFontSize(20);
      doc.setTextColor('#0000ff');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 25, page5Title);
      
      doc.fromHTML($('#investingdifferenceTxt')[0].innerHTML, 15, 35, {
        'width': 170,
        'elementHandlers': specialElementHandlers
      });

      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);
      doc.addPage();

      doc.setFontSize(20);
      doc.setTextColor('#0000ff');
      doc.setFont('helvetica');
      doc.setFontType('normal');
      doc.text(15, 25, page6Title);
      
      doc.fromHTML($('#buyordiyTxt')[0].innerHTML, 15, 35, {
        'width': 170,
        'elementHandlers': specialElementHandlers
      });

      doc.setFont('times');
      doc.setFontType('italic');
      doc.setTextColor('#aaaaaa');
      doc.text(195, 280, 'https://michaelsboost.com/budjut', null, 90);
      
      document.body.style.width = '';
      $(".chart-container").attr('style', 'position: relative; left: 50%; width: 90vw; margin-left: -45vw;');
      $(window).trigger('resize');
      window.scrollTo({ top: getScroll });
      $('.snapshot').fadeOut(function() {
        $(this).remove();
      });

      doc.save(fileName.replace(/ /g, '-') + '.pdf');
    }
  });
  }, 150);
};
function exportPNG() {
  var getScroll = scroll;
  $(document.body).append('<div class="snapshot"><div class="loading"><div class="red"></div><div class="blue"></div><div class="yellow"></div><div class="green"></div></div></div>');
  window.scrollTo({ top: 0 });
  footerurl.style.display = 'block';
  document.body.style.width = '800px';
  $(".chart-container").attr('style', 'position: relative; left: 50%; width: 720px; margin-left: -360px;');
  $(window).trigger('resize');
  setTimeout(function() {
    html2canvas(graphscrollpage, {
      onrendered: function(canvas) {
        var img = canvas.toDataURL('image/png', 1);
        var a = document.createElement("a");
        a.download = fileName.replace(/ /g, '-');
        a.href = img;
        a.click();

        document.body.style.width = '';
        $(".chart-container").attr('style', 'position: relative; left: 50%; width: 90vw; margin-left: -45vw;');
        $(window).trigger('resize');
        window.scrollTo({ top: getScroll });
        footerurl.style.display = 'none';
        $('.snapshot').fadeOut(function() {
          $(this).remove();
        });
      }
    });
  }, 150);
};
function getProjectJSON() {
  projectJSON = {
    "username": username.textContent,
    "goals": [],
    "income"  : grossincome.value,
    "expenses": []
  }
  
  $("#goals p.h1").each(function() {
    projectJSON.goals.push({
      "goal": $(this).text()
    });
  });
  
  $("#expenses input").each(function() {
    projectJSON.expenses.push({
      "expense": $(this).val()
    });
  });
};
function exportJSON() {
  getProjectJSON();
  var blob = new Blob([JSON.stringify(projectJSON)], {type: "application/json;charset=utf-8"});
  saveAs(blob, fileName.replace(/ /g, '-') + ".json");
};

// load json file functions
function loadfile(input) {
  var reader = new FileReader();
  var path = input.value;
  reader.onload = function(e) {
    if (path.toLowerCase().substring(path.length - 5) === ".json") {
      loadedJSON = JSON.parse(e.target.result);
      console.log(loadedJSON);
      importJSON();
    } else {
      alertify.error(selectedFile);
    }
  };
  reader.readAsText(input.files[0]);
};
function dropfile(file) {
  var reader = new FileReader();  
  reader.onload = function(e) {
    if (file.type === "application/json") {
      loadedJSON = JSON.parse(e.target.result);
      console.log(loadedJSON);
      importJSON();
    } else {
      alertify.error(selectedFile);
    }
  }        
  reader.readAsText(file,"UTF-8"); 
};
function importJSON() {
  // import username
  username.textContent = loadedJSON.username;
  focus(username);

  // import goals
  for (var i = 0; i < loadedJSON.goals.length; i++) {
    $("#goals p.h1")[i].textContent = loadedJSON.goals[i].goal;
  }
  
  // import gross income
  grossincome.value = loadedJSON.income;
  mirrorgross.textContent = loadedJSON.income;
  moneyleft.value = loadedJSON.income;

  // import expenses
  for (var i = 0; i < loadedJSON.expenses.length; i++) {
    $("#expenses input")[i].value = loadedJSON.expenses[i].expense
  }
}
$('#loadfile').on('change', function() {
  loadfile(this);
  
  // check is menu is visible
  if ($('#menu').is(':visible')) {
    $('#close').trigger('click');
  }
});

// load svg file on drop
document.addEventListener("dragover", function(e) {
  e.preventDefault();
});
document.addEventListener("drop", function(e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  dropfile(file);
});
