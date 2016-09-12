// Angular App Module and Controller
var app = angular.module('myroutesApp', []);

app.controller('MainCtrl', ['$scope', 'locations', function ($scope, locations) {
	$scope.header = 'Find your route';
	$scope.subHeader = '(Click on the map to pin your locations)';
	
	$scope.initialize = function() {
        $scope.mapOptions = {
			zoom: 15,
			center: new google.maps.LatLng(12.9715987,77.5945627),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		
		$scope.map = new google.maps.Map(document.getElementById('map'), $scope.mapOptions);
		$scope.locations = locations.locations;
		$scope.locationsLen = locations.locations.length;

		var labelIndex = 0;
		var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

		var placeMarker = function(location, map) {
			var marker = new google.maps.Marker({
				position: location,
				label: labels[labelIndex],
				map: map
			});
			$scope.locations.push({lat: marker.position.lat(), lng: marker.position.lng()});
			$scope.locationsLen = locations.locations.length;
		};

		google.maps.event.addListener($scope.map, 'click', function(event) {
			$scope.$apply(function(){
				placeMarker(event.latLng, $scope.map);
				labelIndex++;
			});
		});
    }
    $scope.loadScript = function() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDBLNuhxA9fC0H3YC6oVdTsvisdA1zwcX4&callback=app.controller&sensor=false&language=en';
        document.body.appendChild(script);
        setTimeout(function() {
            $scope.initialize();
        }, 500);
    }

	$scope.getRoute = function() {
		var directionsDisplay = new google.maps.DirectionsRenderer();
		directionsDisplay.setMap($scope.map);

		// DIRECTIONS AND ROUTE
		var directionsService = new google.maps.DirectionsService();
	    var source = $scope.locations[0];
	    var destination = $scope.locations[$scope.locationsLen-1];
	    var waypts = [];
		if ($scope.locationsLen>2) {
			for (var i = 1; i < $scope.locationsLen-1; i++) {
		    	waypts.push({
		    		location: $scope.locations[i],
		    		stopover: true
		    	});
		    }
		}
	 	var request = {
	        origin: source,
	        destination: destination,
	        travelMode: google.maps.TravelMode.DRIVING,
	        unitSystem: google.maps.UnitSystem.METRIC,
	        waypoints: waypts,
	        optimizeWaypoints: true,
	        provideRouteAlternatives: false,
	        avoidHighways: false,
	        avoidTolls: false
	    };
	    directionsService.route(request, function (response, status) {
	        if (status == google.maps.DirectionsStatus.OK) {
	            directionsDisplay.setDirections(response);
	        }
	    });

	    // DISTANCE AND DURATION
	    var service = new google.maps.DistanceMatrixService();
	    service.getDistanceMatrix({
	        origins: [source],
	        destinations: [destination],
	        travelMode: google.maps.TravelMode.DRIVING,
	        unitSystem: google.maps.UnitSystem.METRIC,
	        avoidHighways: false,
	        avoidTolls: false
	    }, function (response, status) {
	        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
	            var originAddress = response.originAddresses[0];
	            var destinationAddress = response.destinationAddresses[0];
	            var distance = response.rows[0].elements[0].distance.text;
	            var duration = response.rows[0].elements[0].duration.text;
	            var dvDistance = document.getElementById("dvDistance");
	            dvDistance.innerHTML = 'From: <span style="color:#008000;">' + originAddress + '</span><br> To: <span style="color:#FF0000;">' + destinationAddress + '</span><br> Distance: ' + distance + ' & Time: ' + duration;
	 
	        } else {
	            alert("Unable to find the distance via road.");
	        }
	    });
	};
}]);

app.factory('locations', [function() {
	var o = {
		locations: []
	};
	return o;
}]);