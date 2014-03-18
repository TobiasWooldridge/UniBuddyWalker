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

var apiBase = "http://api.unibuddy.com.au/api/v2/";
//var apiBase = "http://127.0.0.1:3000/api/v2/";
var universityURL = apiBase + "uni.json";
var buildingsURL = apiBase + "uni/{0}/buildings.json";
var roomsURL = apiBase + "uni/{0}/buildings/{1}/rooms.json";
var roomsSuggestionUrl = apiBase + "uni/{0}/buildings/{1}/rooms/{2}/suggest.json";
var buildingName;
var roomList;
var roomCode;

function currentUniversity() {
    return $("#university").val();
}


function loadUniversities() {
    var universities = $('#university');


    universities.attr('disabled', true);

    $.get(universityURL, function (response) {
        // Sort universities by name.
        response.data.sort(function(a, b) {
            return a.name < b.name ? 1 : -1;
        })

        response.data.forEach(function (university) {
            universities.append($('<option />', {
                text: university.name,
                value: university.code
            }));
        });

        if (response.data.length) {
            universities.attr('disabled', false);
        }

        universities.change();
    }).fail(function () {
        alert("Error loading university list from " + universityURL);
    })
}

function loadBuildings() {
    var buildings = $('#buildings');
    buildings.empty();
    buildings.attr('disabled', true);

    $.get(String.format(buildingsURL, currentUniversity()),function (response) {
        // Sort buildings by name.
        response.data = response.data.sort(function(a, b) {
            return a.name > b.name ? 1 : -1;
        })

        response.data.forEach(function (building) {
            buildings.append($('<option />', {
                text: building.name,
                value: building.code
            }));
        });

        if (response.data.length) {
            buildings.attr('disabled', false);
        }

        buildings.change();
    }).fail(function () {
    });
}

function loadRooms() {
    var rooms = $("#rooms");
    rooms.empty();
    rooms.attr('disabled', true);

    $.get(String.format(roomsURL, currentUniversity(), $("#buildings").val()),function (response) {
        // Sort buildings by name.
        response.data = response.data.sort(function(a, b) {
            return a.code > b.code ? 1 : -1;
        })

        response.data.forEach(function (room) {
            rooms.append($('<option />', {
                text: room.full_code + " (" + room.name + ")",
                value: room.code
            }));
        });

        rooms.change();
        rooms.attr('disabled', false);
    }).fail(function () {
    });
}

function selectRoom() {
    $("#submit_button").attr('disabled', $("#rooms").val() == "");
}

function sendRoomDetailsSuggestion() {
    var data = {
        latitude: $('#latitude').val(),
        longitude: $('#longitude').val()
    }

    $.post(String.format(roomsSuggestionUrl, currentUniversity(), $("#buildings").val(), $("#rooms").val()), data);
}

function displayError(message) {
    $("#errorPanel").text(message);
    $("#errorPanel").slideDown();
}

function getGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else {
        displayError("Geolocation is not supported by this browser.");
    }
}

$(function () {
    loadUniversities();

    //add event listeners
    $('#university').change(loadBuildings);
    $('#buildings').change(loadRooms);
    $('#rooms').change(selectRoom);
    $('#getGPS').click(getGPS);
    $('#submit_button').click(sendRoomDetailsSuggestion);
});

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    $('#latitude').val(latitude);
    $('#longitude').val(longitude);

    var userLocation = new google.maps.LatLng(latitude, longitude);

    var mapPanel = $('#map');
    mapPanel.css('height', '250px');
    mapPanel.css('width', '100%');

    var myOptions = {
        center: userLocation, zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL}
    };

    var map = new google.maps.Map(document.getElementById("map"), myOptions);
    var marker = new google.maps.Marker({position: userLocation, map: map, title: "You are here!"});
}


function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            displayError("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            displayError("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            displayError("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            displayError("An unknown error occurred.");
            break;
    }
}