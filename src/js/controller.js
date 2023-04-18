import * as model from './model.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultsView from './view/resultsView.js';
import paginationView from './view/pagination.View.js';
import bookmarksView from './view/bookmarksView.js';
import addRecipeView from './view/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

//if(module.hot){
//  module.hot.accept();
//}

const controlRecipes = async function(){
  try {

    const id = window.location.hash.slice(1);
    if(!id) return;
    recipeView.renderSpinner();

    //Updat results view to mark selected search results
    resultsView.update(model.getSearchResultPage());
    
    // loading the recipe
    await model.loadRecipe(id);
    
    
    // Rendering the recipe
    recipeView.render(model.state.recipe);  
    
    bookmarksView.update(model.state.bookmarks);
  } catch(err) {
    recipeView.renderError();
    console.log(err);
  }
};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();
    
    const query = searchView.getQuery();
    if(!query) return;

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultPage());

    paginationView.render(model.state.search);
  } catch(err){
    console.log(err);
  }
}

const controlPagination = function(goToPage) {
  console.log(goToPage);
  resultsView.render(model.getSearchResultPage(goToPage));

  paginationView.render(model.state.search);

}

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view
  //
  recipeView.update(model.state.recipe);
}

const controlAddbookmark = function() {
  //Add or remove a bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  
  //console.log(model.state.recipe);
  //update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  try{
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderSpinner();

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(function() {
      addRecipeView.toggleWindow();

    }, MODAL_CLOSE_SEC * 1000);
    

  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
  

}

const init = function () {
  bookmarksView.addHandleRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddbookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  
}

init();
//window.addEventListener('hashchange', controlRecipe);