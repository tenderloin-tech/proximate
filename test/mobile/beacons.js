/******************************************************************
* Beacons Service
******************************************************************/

describe('Settings service', function() {

  beforeEach(function() {
    module('proximate');
    module('ionic');
    module('proximate.services');
  });

  var JSONbeacons;

  beforeEach(inject(function(_Beacons_, $httpBackend) {

      // Overriding the Beacons factory, and setting up http mocking

    Beacons = _Beacons_;
    httpBackend = $httpBackend;

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

    JSONbeacons = JSON.stringify(testRegions);

  }));

    // These tests won't work with the plugin currently, as
    // this plugin is not configured in a testable manner

  xit('Should create regions from beacons', function() {
    expect(typeof Beacons.regionsFromBeacons(JSONbeacons)).toEqual('Array');
  });

  xit('Should setup the delegate object and start monitoring upon Test Beacon Setup', function() {

    spyOn(Beacons, 'startMonitoringRegions');
    Beacons.setupTestBeacons(function() {});
    expect(Beacons.startMonitoringRegions).toHaveBeenCalled();
  });

});
