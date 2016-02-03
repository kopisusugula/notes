(function() {
  var applicationId = '2MO0TDI0YD';
  var searchKey = 'f3a8898b2f25bc5f6f5c08e4856c3792';
  var client = algoliasearch(applicationId, searchKey);
  var index = client.initIndex('notes');
  var query = document.getElementById('query');
  var postList = document.getElementById('post-list');

  var onQueryChange = function() {
    var value = query.value;
    window.scroll(0, 0);
    performSearch(value);
  };

  var performSearch = function(query) {
    index.search(query, {facets: '*', facetFilters: ['type:document']}, handleResults);
  };

  var handleResults = function(err, content) {
    if (err) {
      console.error(err);
      return;
    }

    displayResults(content);
  };

  var displayResults = function(content) {
    var compiled = _.template('<% _.forEach(hits, function(hit) { %><li class="post-list__item"><div class="post-list__category"><a href="<%= hit.url %>"><img src="/assets/img/categories/<%= hit.category %>.png" alt="<%= hit.category %>" class="post-list__icon" /></a></div><div class="post-list__details"><h2 class="post-list__title"><a class="post-list__link" href="<%= hit.url %>"><%= hit._highlightResult.title.value %></a></h2><span class="post-list__meta"><%= hit._highlightResult.text.value %></span></div></li><% }); %>');
    postList.innerHTML = compiled({ 'hits': content.hits });
  };

  query.onkeyup = onQueryChange;
})();
