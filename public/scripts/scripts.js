$(document).ready(function() {
  var stopsIndexed;
  var tripsIndexed;
  var routesIndexed;

  var target = document.getElementById('loading');
  new Spinner(opts).spin(target);

  function getSavedRoute() {
    return readCookie('saved-route');
  }

  function getSavedTrip() {
    return readCookie('saved-trip');
  }

  function sortTripsByTime(trips) {
    const entities = trips.entity;
    const sortedEntities = _.sortBy(entities, function(update) {
      return moment(update.trip_update.trip.start_time, 'HH-mm-ss');
    });
    return { header: trips.header, entity: sortedEntities };
  }

  function tsToTime(ts) {
    return moment.unix(ts).format('h:mma');
  }

  function getStopDetail(id) {
    if (stopsIndexed.hasOwnProperty(id)) {
      return stopsIndexed[id].stop_name;
    }
    return 'Unknown stop id: ' + id;
  }

  function getTripDetail(id) {
    if (tripsIndexed.hasOwnProperty(id)) {
      return tripsIndexed[id];
    }
    return 'Unknown trip id: ' + id;
  }

  function createSelectOptions(optionList) {
    var html = '';
    $.each(optionList, function(index, value) {
      html += '<option value="' + value.value + '">';
      html += value.label;
      html += '</option>';
    });
    return html;
  }

  function formatDelay(seconds) {
    var secondsInt = parseInt(seconds, 10);
    var delay = secondsInt / 60;
    var modifier = (secondsInt < 0) ? 'early' : 'late';
    if (seconds === 0) {
      return 'On time';
    }
    return Math.abs(delay) + ' min ' + modifier;
  }

  function loadTrips() {
    $.getJSON('/static/trips', function(trips) {
      tripsIndexed = _.keyBy(trips, 'trip_id');
      initUI();
    });
  }

  function loadRoutes() {
    $.getJSON('/static/routes', function(routes) {
      routesIndexed = _.keyBy(routes, 'route_id');
      loadTrips();
    });
  }

  function loadStops() {
    $.getJSON('/static/stops', function(stops) {
      stopsIndexed = _.keyBy(stops, 'stop_id');
      loadRoutes();
    });
  }

  function hideSpinner() {
    $('.loading').hide();
  }

  function showSpinner() {
    $('.loading').show();
  }

  function setDirection() {
    // set inbound if am, outbound if pm
  var hours = new Date().getHours();
  var direction = hours >= 12 ? 'outbound' : 'inbound';
    $("#" + direction).prop("checked", true);
  }

  function displayTrips(trips, routeId) {
    var html = '';
    var thisRoute;
    var thisRouteName = '';
    var savedTrip;

    $('.last-updated').html('Updated ' + tsToTime(trips.header.timestamp));
    if (trips.entity.length < 1) {
      html += 'RIPTA is not returning any data';
    } else {
      thisRoute = routesIndexed[routeId];
      thisRouteName = thisRoute.route_short_name + ' ' + thisRoute.route_long_name;
      html += '<h4>' + thisRouteName + '</h4>';
      $.each(trips.entity, function(key, trip) {
        var tripUpdate = trip.trip_update;
        var stopTimeUpdate = tripUpdate.stop_time_update;
        var thisTrip = tripUpdate.trip;
        // var thisRouteId = thisTrip.route_id;
        // var title = 'Route ' + thisRouteId;
        var tripId = thisTrip.trip_id;
        var startTime = moment(thisTrip.start_time, 'HH-mm-ss').format('h:mma');
        var description = getTripDetail(tripId).trip_headsign;
        // var direction_id = getTripDetail(tripId).direction_id;

        var delay;
        var delayStr;

        if (stopTimeUpdate.length === 0) {
          delayStr = 'no info';
        } else {
          delay = (_.first(stopTimeUpdate).arrival !== null)
            ? _.first(stopTimeUpdate).arrival.delay
            : _.first(stopTimeUpdate).departure.delay;
          delayStr = formatDelay(delay);
        }

        html += ['<div class="trip-heading" id="' + tripId + '">', startTime, description, '-', delayStr, '</div>'].join(' ');
        html += '<table class="trip-update table table-sm table-striped">';
        html += '<thead>';
        html += '<tr>';
        html += '<th>Time</th>';
        html += '<th>Stop</th>';
        html += '<th>Status</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';

        $.each(trip.trip_update.stop_time_update, function(k, update) {
          var tooltip = 'tripId: ' + tripId + ', stop_id: ' + update.stop_id;
          var atime = '';
          var thisStop = '';
          html += '<tr title="' + tooltip + '">';
          if (update.arrival === null) {
            atime = 'Departs ' + tsToTime(update.departure.time);
            thisStop = getStopDetail(update.stop_id);
          } else {
            atime = 'Arrives ' + tsToTime(update.arrival.time);
            thisStop = getStopDetail(update.stop_id);
          }
          html += '<td>' + atime + '</td>';
          html += '<td>' + thisStop + '</td>';
          html += '<td>' + delayStr + '</td>';
          html += '</tr>';
        });
        html += '</tbody>';
        html += '</table>';
      });

      savedTrip = getSavedTrip();
      if (savedTrip !== null) {
        $('#' + savedTrip).next().toggle();
      }
    } // end else

    $('.content').html(html);
    $('.trip-heading').on('click', function() {
      createCookie('saved-trip', this.id, 365);
      $(this).next().toggle();
    });
  }

  function processTrips() {
    var routeId = $('.select-route').val();
    var direction = $('input[name=direction]:checked').val();
    showSpinner();
    $.getJSON('/api/tripupdates/route/' + routeId + '/' + direction, function(trips) {
      displayTrips(sortTripsByTime(trips), routeId);
      hideSpinner();
    });
  }

  function initUI() {
    var optionList = [];
    var optionsHtml;
    var savedRoute;
    setDirection();

    $.each(routesIndexed, function(key, value) {
      var label = value.route_short_name + ' ' + value.route_long_name;
      optionList.push({value: value.route_id, label: label});
    });
    optionsHtml = createSelectOptions(optionList);
    $('.select-route').html(optionsHtml);

    savedRoute = getSavedRoute();
    if (savedRoute !== null) {
      $('.select-route').val(savedRoute);
    }

    $('.select-route, .direction').on('change', function() {
      createCookie('saved-route', $('.select-route').val(), 365);
      processTrips();
    });
    $('.button-refresh').on('click', function() {
      processTrips();
    });
    $('.select-route').trigger('change');
  }

  // start
  loadStops();
});
