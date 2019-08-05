$(document).ready(function() {
    // article-container div where all the dynamic content will go addding event listeners to any dynamically generated "save article" and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn.save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);
    $(".clear").on("click", handleArticleClear);
  
    function initPage() {
      // Run an AJAX request for any unsaved headlines
      $.get("/api/headlines?saved=false").then(function(data) {
        articleContainer.empty();
        // If we have headlines, render them to the page
        if (data && data.length) {
          renderArticles(data);
        } else {
          // Otherwise render a message explaining we have no articles
          renderEmpty();
        }
      });
    }
  
    function renderArticles(articles) {
      // handles appending HTML containing article data to the page, passed an array of JSON containing all available articles in database
      var articleCards = [];
      // pass each article JSON object to the createCard function, card with article data inside
      for (var i = 0; i < articles.length; i++) {
        articleCards.push(createCard(articles[i]));
      }
      articleContainer.append(articleCards);
    }
  
    function createCard(article) {
      var card = $("<div class='card'>");
      var cardHeader = $("<div class='card-header'>").append(
        $("<h3>").append(
          $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
            .attr("href", article.url)
            .text(article.headline),
          $("<a class='btn btn-success save'>Save Article</a>")
        )
      );
  
      var cardBody = $("<div class='card-body'>").text(article.summary);
  
      card.append(cardHeader, cardBody);
      card.data("_id", article._id);
      return card;
    }
  
    function renderEmpty() {
      var emptyAlert = $(
        [
          "<div class='alert alert-warning text-center'>",
          "<h4>Oops! Looks like we don't have any new articles.</h4>",
          "</div>",
          "<div class='card'>",
          "<div class='card-header text-center'>",
          "<h3>What Would You Like To Do?</h3>",
          "</div>",
          "<div class='card-body text-center'>",
          "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
          "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
          "</div>",
          "</div>"
        ].join("")
      );
      articleContainer.append(emptyAlert);
    }
  
    function handleArticleSave() {
      var articleToSave = $(this)
        .parents(".card")
        .data();

      $(this)
        .parents(".card")
        .remove();
  
      articleToSave.saved = true;
      $.ajax({
        method: "PUT",
        url: "/api/headlines/" + articleToSave._id,
        data: articleToSave
      }).then(function(data) {
        if (data.saved) {
          initPage();
        }
      });
    }
  
    function handleArticleScrape() {
      $.get("/api/fetch").then(function(data) {
        initPage();
        bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
      });
    }
  
    function handleArticleClear() {
      $.get("api/clear").then(function() {
        articleContainer.empty();
        initPage();
      });
    }
  });
  