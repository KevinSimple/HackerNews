(function () {
  'use strict';
  angular.module('users')
    .service('newsService', ['$http', '$q', '$sce', NewsService]);

  /**
    * News Data Service    
    * remote data service call(s).
    * 
    */
  function NewsService($http, $q, $sce) {

    // define interface
    var service = {
      storyIds: [],
      stories: [],
      getTop500StoryIds: getTop500StoryIds,
      getStoryById: getStoryById,
      getMaxStories: getMaxStories,
      capacity: 25, //Default to 25
      promises: [],
      getLatestStories: getLatestStories,
      setCapacity :setCapacity

    };

    return service;


    //Define service methods

     /**
     * Set max stories for Get 
     */ 
    function setCapacity(max)
    {
      service.capacity =max;
    }

    /**
     * Return stories
     */ 
    function getLatestStories() {
      return service.stories;
    }

    /**
     * Get max stories based on the capacity
     */ 
    function getMaxStories() {

      //Empty sevice stories
      service.stories = [];

      //Get stories ids
      service.getTop500StoryIds().then(function (ids) {
        //Get each story from id and push to stroies array
        for (var i = 0; i < service.capacity; i++) {
          var promise = service.getStoryById(ids[i]);
          service.promises.push(promise);
        }
      }, function () {
        console.log('story ids retrieval failed.');
      }
      );
      return $q.all(service.promises);
    }

    /**
     * Get Stroy Ids
     */  
    function getTop500StoryIds() {
      var def = $q.defer();
      $http.get("https://hacker-news.firebaseio.com/v0/topstories.json")
        .success(function (data) {
          service.storyIds = data;
          def.resolve(data);
          console.log('storyIds returned to controller.', data);
        })
        .error(function () {
          def.reject("Failed to get storyIds");
        });
      return def.promise;
    }

     /**
     * Get stroy by id
     */ 
    function getStoryById(id) {
      var def = $q.defer();
      $http.get("https://hacker-news.firebaseio.com/v0/item/" + id + ".json ")
        .success(function (data) {
          def.resolve(data);
          data.url = $sce.trustAsResourceUrl(data.url);
          data.isClicked = false;
          service.stories.push(data);
          console.log('Story returned to controller.', data);
        })
        .error(function () {
          def.reject("Failed to get story for id:" + id);
        });
      return def.promise;
    }
  }
 
})();
