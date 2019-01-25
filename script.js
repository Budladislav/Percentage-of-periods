'use strict';

/* GLOBAL VARIABLES */
  let aBarsType = ['0_minute', '1_hour', '2_day','3_week','4_month',
    '5_year']; //first char - number of bar id
  let aBars = []; //all Bar objects, collect at fInitializeAllBars()
/* GLOBAL VARIABLES end */

/* CONSTRUCTORS */
  //constructor of main object - bar
  let Bar = function(type) {
    this.barIdNum = type[0];
    this.bar = document.getElementById(`bar${this.barIdNum}`);
    this.barId = this.bar.id;
    this.span = document.getElementById(`span_bar${this.barIdNum}`);
    this.isActive = false; //default
    this.percent = this.getPersent(type); //each type of Bar has own %
    this.percent = +this.percent.toFixed(2); 
    this.activeMessage = this.percent + '% of current ';
    this.unactiveMessage = this.percent.toFixed(0) + '% ';
    //localStorage['lsState'] keeps state (Id num of last active bar)
    //if there are not active bars 'lsState' will be undefined or -1
    if (this.barIdNum === localStorage['lsState']){
      this.activateBar(); 
    }
  }
/* CONSTRUCTORS end */

/* PROTOTYPE METHODS */
  /*new proto method for Date(), returns count of days in the current month.
  Trick: Date() with 0 day return date with last day of previous month.
  So to get number of days in current month need to check
  Date (CurrentYear,NextMonth,0); */
  Date.prototype.daysInMonth = function() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate(); 
  };
  //returns count of days of the current year (no leap - 365 / leap - 366)
  Date.prototype.daysInYear = function(){
    let lastDayOfFebruary = new Date(this.getFullYear(),2,0).getDate();
    let result = (lastDayOfFebruary === 29) ? 366 : 365;
    return result;
  }
  //return number of past days of current Year (0-365).
  //f.e. if today 2 february - return 32 
  Date.prototype.pastDaysOfYear = function(){
    let DateOfFirstDayOfYear = new Date(this.getFullYear(),0,1);
    let DateOfCurrentDay = new Date(this.getFullYear(),this.getMonth(),
      this.getDate());
    let NumberOfPastDaysOfYearInMs = DateOfCurrentDay - DateOfFirstDayOfYear;
    return NumberOfPastDaysOfYearInMs / 86400000; // 86400000 = 1 day in ms
  }
  //return % for current type of bar, and initialize updating of updateble bars
  Bar.prototype.getPersent = function(type){
    switch (type) {
      case '0_minute':
        this.updateMinutePercent(); /*(1sec-update)*/
        return this.getMinutePercent();
      case '1_hour':
        this.updateHourPercent(); /*(minute-update)*/
        return this.getHourPercent();
      case '2_day':
        this.updateDayPercent(); /*(15-minutes-update)*/
        return this.getDayPercent();
      case '3_week':
        return this.getWeekPercent();
      case '4_month':
        return this.getMonthPercent();
      case '5_year':
        return this.fGetYearPercent();
    }
  }
  /*Receive a fractional number of percent, rounds it to 2 decimal places, 
  update % of gradient on bar and change num in span message if bar active*/
  Bar.prototype.updateFillingOfBar = function(percent = 1){
    $(this.bar).css('background',`linear-gradient(to right,` +
        ` rgba(175,175,175,0.75) ${percent.toFixed(2)}%,` +
        ` rgba(200,200,200,0.2) 0%)`);
    (this.isActive)
      ? $(this.span).text(percent.toFixed(2) + '% of current ')
      : $(this.span).text(percent.toFixed(0) + '% ');
  }
  //update percent and massage properties
  Bar.prototype.updateObjectPropertys = function(percent){
    this.percent = +percent.toFixed(2);
    this.activeMessage = this.percent + '% of current ';
    this.unactiveMessage = this.percent.toFixed(0) + '% ';
  }
  /*return a percent of past piece of current minute (current seconds / 60 seconds*/
  Bar.prototype.getMinutePercent = function(){
    let nCurrentSecond = new Date().getSeconds(); //0-59
    return nCurrentSecond / 60 * 100;
  }
  //Updating filling of bar and text in span of bar every second
  Bar.prototype.updateMinutePercent = function(){
    let nCurrentPercent = this.getMinutePercent();
    this.updateFillingOfBar(nCurrentPercent);
    setInterval(()=>{
      nCurrentPercent = this.getMinutePercent();
      this.updateFillingOfBar(nCurrentPercent);
      this.updateObjectPropertys(nCurrentPercent);
    },1000)
  }
  /*return a percent of past piece of current hour (current minutes
    / 60 (minutes) + additional percent of past secons of current minute) */
  Bar.prototype.getHourPercent = function(){
    let nCurrentMinute = new Date().getMinutes(); //0-59
    let nAdditionalPersentOfCurrentMinute = this.getMinutePercent() / 100 / 60;
    return (nCurrentMinute / 60 + nAdditionalPersentOfCurrentMinute) * 100;
  }
  //Updating filling of bar and text in span of bar every minute
  Bar.prototype.updateHourPercent = function(){
    let nCurrentPercent = this.getHourPercent();
    this.updateFillingOfBar(nCurrentPercent);
    setInterval(()=>{
      nCurrentPercent = this.getHourPercent();
      this.updateFillingOfBar(nCurrentPercent);
      this.updateObjectPropertys(nCurrentPercent);
    },60000) //update every 1 minute
  }
  /*return a percent of past piece of current day (current hours
    / 24 (hours) + additional percent of past minutes of current hour) */
  Bar.prototype.getDayPercent = function(){
    let nCurrentHour = new Date().getHours(); //0-23
    let nAdditionalPersentOfCurrentHour = this.getHourPercent() / 100 / 24;
    return (nCurrentHour / 24 + nAdditionalPersentOfCurrentHour) * 100;
  }
  //Updating filling of bar and text in span of bar if it active every 15 minutes
  Bar.prototype.updateDayPercent = function(){
    let nCurrentPercent = this.getDayPercent();
    this.updateFillingOfBar(nCurrentPercent);
    setInterval(()=>{
      nCurrentPercent = this.getDayPercent();
      this.updateFillingOfBar(nCurrentPercent);
      this.updateObjectPropertys(nCurrentPercent);
    },900000) //update every 15 minutes
  }
  /*return a percent of past piece of current Week (current day of week
    / 7 (days) + additional percent of past hours of current day)
    and update fill of bar */
  Bar.prototype.getWeekPercent = function(){
    let nCurrentDayOfWeek = new Date().getDay(); //0-6
    let nAdditionalPersentOfCurrentDay = this.getDayPercent() / 100 / 7;
    let nWeekPercent = (nCurrentDayOfWeek / 7
      + nAdditionalPersentOfCurrentDay) * 100;
    this.updateFillingOfBar(nWeekPercent);
    return nWeekPercent;
  }
  /*return a percent of past piece of current Month (current day of month
    / days of current month + additional percent of past hours of current day)
    and update fill of bar */
  Bar.prototype.getMonthPercent = function(){
    let nCurrentDayOfMonth = new Date().getDate() - 1; //0-30
    let nDaysInCurrentMonth = new Date().daysInMonth(); //28-31
    let nAdditionalPersentOfCurrentDay = this.getDayPercent() / 100
      / nDaysInCurrentMonth;
    let nMonthPercent = (nCurrentDayOfMonth / nDaysInCurrentMonth
      + nAdditionalPersentOfCurrentDay) * 100;
    this.updateFillingOfBar(nMonthPercent);
    return nMonthPercent;
  }
  /*return a percent of past piece of current Year (current day
    / nDaysInCurrentYear + additional percent of past days of current month)
    and update fill of bar */
  Bar.prototype.fGetYearPercent = function(){
    let currentTimeStamp = new Date();
    let nNumOfPastDaysOfYear = currentTimeStamp.pastDaysOfYear(); //0-365
    let nDaysInCurrentYear = currentTimeStamp.daysInYear(); //365 or 366 if leap year
    let nAdditionalPersentOfCurrentDay = this.getDayPercent() / 100 / nDaysInCurrentYear;
    let nYearPercent = (nNumOfPastDaysOfYear / nDaysInCurrentYear
      + nAdditionalPersentOfCurrentDay) * 100;
    this.updateFillingOfBar(nYearPercent);
    return nYearPercent;
  }
  //update state of bar to active, change appearance and text of bar
  Bar.prototype.activateBar = function(){
    $(this.bar).addClass('bar-active');
    $(this.span).text(this.activeMessage);
    this.isActive = true;
    localStorage['lsState'] = this.barIdNum;
  }
  //update state of bar to deactivated, change appearance and text of bar to default.
  Bar.prototype.deactivateBar = function(){
    this.isActive = false;
    localStorage['lsState'] = -1; // -1 and undefined - initial state
    $(this.bar).removeClass('bar-active');
    $(this.span).text(this.unactiveMessage);
    if (fIsMobile()){ //remove phantom hover effect on mobile devices
      $(this.bar).css({
        'border': '1px dashed black',
        'box-shadow': 'none'
      })
    }
  }
/* PROTOTYPE METHODS end */

/* FUNCTIONS */
  /*setup intrface. Used for dynamic setting sizes of elements.
  min-width 300px, min-height 600px. if client size fewer - scrollbars
  if bigger - content size expands to client size*/
  let fSetInterface = () => {
    let n_WindowWidth = document.documentElement.clientWidth;
    let n_WindowHeight = document.documentElement.clientHeight;
    let n_ContainerWidth;
    let n_ContainerHeight;
    if (n_WindowWidth < 300){
      n_ContainerWidth = 300;
    } else {
      n_ContainerWidth = n_WindowWidth * 0.975;
    }
    if (n_WindowHeight < 600){
      n_ContainerHeight = 600;
    } else {
      n_ContainerHeight = n_WindowHeight * 0.975;
    }
    $('body').css({
      'min-width' : n_ContainerWidth + 'px',
      'min-height' : n_ContainerHeight + 'px'
    });
    $('#container').css({
      'width' : n_ContainerWidth + 'px',
      'height' : n_ContainerHeight + 'px'
    });
    let nNumberOfBars = aBarsType.length;
    let n_ContentHeight = $('.content').height();
    let n_ContentVoid = n_ContentHeight / 5; //void place that active bar will fill
    let n_BarHeight = (n_ContentHeight - n_ContentVoid) / nNumberOfBars;
    let n_Margin = n_BarHeight / 10;
    $('.bar').css({
      'margin-bottom': n_Margin + 'px',
      'height': n_BarHeight + 'px'
    });
    $('.bar').last().css('margin-bottom','0px');
    //Increases text size on mobile devices
    if (fIsMobile()){
      $('body').css('font-size','2em');
    }
    fSetAndUpdateDateTime();
  }
  //serves to set and update date and time in header
  let fSetAndUpdateDateTime = () => {
    let currentDateAndTime = new Date().toLocaleString();
    let transformWeekNumToStr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat',];
    let currentWeekDay = transformWeekNumToStr[new Date().getDay()];
    let fullDateTime = currentWeekDay + currentDateAndTime;
    $('#date').text(`${currentWeekDay}, ${currentDateAndTime}`);
    setInterval(()=>{
      currentDateAndTime = new Date().toLocaleString();
      $('#date').text(`${currentWeekDay}, ${currentDateAndTime}`);
    },1000);
  }
  //check is it device mobile (with touchscreen). True - mobile/ false - desctop
  let fIsMobile = () => {
    return ('ontouchstart' in document.documentElement);
  }
  let fInitializeAllBars = () => {
    for (let i = 0; i < aBarsType.length; i++){
      aBars[i] = new Bar(aBarsType[i]);
    }
  }
  let deactivateAllBars = (aBars) => {
    localStorage['lsState'] = -1; // -1 or undefined - initial state
    for (let i = 0; i < aBars.length; i++){
      aBars[i].isActive = false;
      aBars[i].bar.classList.remove("bar-active");
      aBars[i].span.innerHTML = aBars[i].unactiveMessage;
    }
  }
  
/* FUNCTIONS end */

/* EVENTS */
  //click on any bar, or bar childs. Deactivate all bars and activate clicked bar
  $('.bar').click((event)=>{
    // event.currentTarget.id == this.event.target.id
    let eventBarIdNum = event.currentTarget.id[event.currentTarget.id.length - 1];
    //click on active bar - fold it
    if (aBars[eventBarIdNum].isActive) {
      aBars[eventBarIdNum].deactivateBar();
    } else { //click on non-active bar - fold all, and activate event-bar
      deactivateAllBars(aBars);
      aBars[eventBarIdNum].activateBar();
    }
  });
  //reload page from chache if orientation of device changed 
  window.addEventListener("orientationchange", ()=>{location.reload(false);});
/* EVENTS end */

/* MAIN CODE */
  fSetInterface();
  fInitializeAllBars();
/* MAIN CODE end */