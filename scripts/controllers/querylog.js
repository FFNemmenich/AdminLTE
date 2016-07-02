'use strict';

/**
 * @ngdoc function
 * @name piholeAdminApp.controller:QuerylogCtrl
 * @description
 * # QuerylogCtrl
 * Controller of the piholeAdminApp
 */
angular.module('piholeAdminApp')
  .controller('QuerylogCtrl', ['$scope', 'API', 'CacheService', 'uiGridConstants', '$translate', 'i18nService','$rootScope', '$routeParams', function ($scope, API, CacheService, uiGridConstants, $translate, i18nService, $rootScope, $routeParams) {
    //
    var queries = CacheService.get('queryPage');
    var tableCache = function () {
      if (!queries) {
        $scope.refreshing = true;
        API.getAllQueries().then(function (result) {
          var queries = result;
          $scope.refreshing = false;
          CacheService.put('queryPage', queries);
          $scope.gridOptions.data = queries;
          $scope.$broadcast('queriesLoaded', queries);
          //callback( { data: queries } );
        });
      } else {
        $scope.gridOptions.data = queries;
        //callback( { data: queries } );
      }
    };

    var rowTemplate = function(){
      return '<div ng-class="{ \'pi-holed\': grid.appScope.rowFormatter( row ) }">' +
        '  <div ng-if="row.entity.merge">{{row.entity.title}}</div>' +
        '  <div ng-if="!row.entity.merge" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }"  ui-grid-cell></div>' +
        '</div>';
    };

    $scope.rowFormatter = function( row ) {
      return row.entity.status === 'Pi-holed';
    };
    $scope.langs = i18nService.getAllLangs();
    $scope.lang = $translate.use();
    $scope.gridOptions = {
      rowTemplate: rowTemplate(),
      enableFiltering: true,
      rowHeight:38,
      columnDefs: [
        { name: 'date',
          cellTemplate: '<div class="ui-grid-cell-contents" title="TOOLTIP">{{COL_FIELD | date: \'dd-MMMM-yyyy HH:mm:ss\'}}</div>',
          sort: {
            direction: uiGridConstants.DESC,
            priority: 0
          }
        },
        { name: 'recordType',
          filter: {
            term: ($routeParams.filterType) ? $routeParams.filterType : ''
          }
        },
        { name: 'domain',
          filter: {
            term: ($routeParams.filterDomain) ? $routeParams.filterDomain : ''
          }
        },
        { name: 'Client IP',
          field: 'clientIP',
          filter: {
            term: ($routeParams.filterIP) ? $routeParams.filterIP : ''
          }
        },
        { name: 'status',

          filter: {
            term: '',
            type: uiGridConstants.filter.SELECT,
            selectOptions: [ { value: 'Pi-holed', label: 'Pi-holed' }, { value: 'OK', label: 'OK' } ]
          }
        }
      ]
    };
    $rootScope.$on('languageChanged', function(evt, lang){
      $scope.lang = $translate.use();
    });

    tableCache();
    $scope.refreshData = function(){
      CacheService.put('queries', null);
      tableCache()
    };

  }]);
