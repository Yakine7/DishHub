import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js';
import 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}
//api key : 53069c00-8b82-49a3-b224-140a7c065be2

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    // resultsView.renderSpinner();
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0 Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) loading recipe
    await model.loadRecipe(id);
    // const {recipe} = model.state.recipe

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);
    
    recipeView._scrollToRecipe();

    // recipeView._scrollToRecipe()
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};
// controlRecipes();

const controlSearchResults = async function () {
  try {
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);
    // console.log(model.state.search.results);

    // console.log(model.getSearchResultsPage(1));

    // 3) render results
    resultsView.render(model.getSearchResultsPage(1));

    // 4) render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  console.log('Pag Controller', goToPage);
  // resultsView._clear();
  // paginationView._clear();

  // 1) render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the recipe servings
  model.updateServings(newServings);

  // Update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  console.log(model.state.recipe);
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, 2000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err);
  }
};


const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerBookmark(controlAddBookmark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
controlSearchResults();
