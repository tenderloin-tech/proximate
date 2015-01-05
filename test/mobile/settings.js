/******************************************************************
* Settings Controller
******************************************************************/

describe('Settings Controller - functions and values', function() {

  beforeEach(module('proximate'));

  var ctrl;
  var scope;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    ctrl = $controller('SettingsCtrl', {
      $scope: scope
    });
  }));

  it('Should have a function to set the username', function() {
    expect(scope.updateUsername).toBeDefined();
  });

  it('Should have a data object', function() {
    angular.element(document).ready(function() {
      expect(scope.data).toBeDefined();
    });
  });
});

/******************************************************************
* Settings Service
******************************************************************/

describe('Settings service', function() {

  beforeEach(module('proximate'));

  beforeEach(inject(function(_Settings_, $httpBackend) {

    // Overriding the Settings factory, and setting up http mocking

    Settings = _Settings_;
    httpBackend = $httpBackend;

    Settings.data.deviceID = '12345678';
    var testRegions = [{
      uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
      identifier : 'Estimote Icy One',
      minor : 10907,
      major : 23516
    }, {
      uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
      identifier : 'Estimote Blue One',
      minor : 50306,
      major : 54690
    }, {
      uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
      identifier : 'Estimote Mint One',
      minor : 3704,
      major : 57868
    }];

    // Mock http routes

    httpBackend.whenPOST('/api/register').respond('Success');
    httpBackend.whenPOST('/api/beacons').respond(testRegions);

  }));

  it('Should set username', function() {
    var testName = 'Bob';
    Settings.updateUsername(testName).then(function(data) {
      expect(data).toEqual('Success');
      expect($localStorage.get('username')).toBeDefined();
    });
  });

  it('Should get the list of beacons', function() {
    Settings.updateBeaconList().then(function(data) {
      expect(typeof data).toEqual('Array');
      expect(data[0].identifier).toEqual('Estimote Icy One');
      expect($localStorage.get('beaconList')).toBeDefined();
    });
  });

  it('Should fetch the deviceID', function() {
    expect(Settings.data.deviceID).toBeDefined();
  });

  it('Should update the deviceID', function() {
      //how do we test this?
  });
});
