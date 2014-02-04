if (!String.format) {
  String.format = function (format) {

    var args = Array.prototype.slice.call(arguments, 1);
    var sprintfRegex = /\{(\d+)\}/g;

    var sprintf = function (match, number) {
      return number in args ? args[number] : match;
    };

    return format.replace(sprintfRegex, sprintf);
  };
}

var buildingsURL = "http://api.unibuddy.com.au/api/v2/uni/flinders/buildings.json"
var roomsURL = "http://api.unibuddy.com.au/api/v2/uni/flinders/buildings/{0}/rooms.json"
var buildingCodes = {};
var roomList;

function loadBuilding() {
	var buildingName = this.value;
	var room = document.getElementById("room");
	$(room).empty();

	$.get(String.format(roomsURL, buildingCodes[buildingName]), function(data) {
		roomList = data;
		var option = document.createElement("option");
		option.text="";
		room.add(option);
		data.data.forEach(function(entry){
			option = document.createElement("option");
			option.text = entry.full_code + " (" + entry.name + ")";
			room.add(option);
		});
		room.disabled = false;
	}).fail(function() {room.disabled = true;});	
}

function loadRoom() {
	var roomCode = this.value;
	if (roomCode != "") {
		document.getElementById("submit_button").disabled = false;
	} else {
		document.getElementById("submit_button").disabled = true;
	}
}

function post() {
	alert("to post entered data to api.unibuddy.com.au");
}

var x;
function getGPS() {

	if (navigator.geolocation)
    {
    	navigator.geolocation.getCurrentPosition(showPosition,showError);
    }
  	else {
  		x.innerHTML="Geolocation is not supported by this browser.";
  	}
}

$(function() {
	//simulate ajax to server
	$.get(buildingsURL, function(data) {
		var building = $('#building')[0];
		var option = document.createElement("option");
		option.text="";
		building.add(option);	
		data.data.forEach(function(entry){
			option = document.createElement("option");
			option.text=entry.name;
			building.add(option);
			buildingCodes[entry.name] = entry.code;
		});
	}).fail(function() {
		alert("an error occured getting rooms list");
	});

	//add event listeners
	$('#building').on('change', loadBuilding);
	$('#room').on('change', loadRoom);
	$('#getGPS').on('click', getGPS);
	$('#submit_button').on('click', post);
	x = $('#GPS_coords')[0];
});

function showPosition(position)
  {
  lat=position.coords.latitude;
  lon=position.coords.longitude;
  latlon=new google.maps.LatLng(lat, lon)
  mapholder=document.getElementById('mapholder')
  mapholder.style.height='250px';
  mapholder.style.width='100%';

  var myOptions={
  center:latlon,zoom:14,
  mapTypeId:google.maps.MapTypeId.ROADMAP,
  mapTypeControl:false,
  navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
  };
  var map=new google.maps.Map(document.getElementById("mapholder"),myOptions);
  var marker=new google.maps.Marker({position:latlon,map:map,title:"You are here!"});
  }

function showError(error)
  {
  switch(error.code) 
    {
    case error.PERMISSION_DENIED:
      x.innerHTML="User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML="Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML="The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML="An unknown error occurred."
      break;
    }
  }