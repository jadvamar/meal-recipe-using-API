document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  const mealList = document.getElementById("meal");
  const mealDetailsContent = document.querySelector(".meal-details-content");
  const recipeCloseBtn = document.getElementById("recipe-close-btn");

  searchBtn.addEventListener("click", getMealList);
  mealList.addEventListener("click", getMealRecipe);
  recipeCloseBtn.addEventListener("click", () => {
    mealDetailsContent.parentElement.classList.remove("showRecipe");
  });

  function getMealList() {
    let searchInputTxt = document.getElementById("search-input").value.trim();
    if (searchInputTxt === "") {
      alert("Please enter a valid search query.");
      return;
    }

    fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data from the API.");
        }
        return response.json();
      })
      .then((data) => {
        let html = "";
        if (data.meals && data.meals.length > 0) {
          data.meals.forEach((meal) => {
            html += `<div class="meal-item" data-id="${meal.idMeal}">
                  <div class="meal-img">
            <img src="${meal.strMealThumb}" alt="food">
           </div>
          <div class="meal-name">
            <h3>${meal.strMeal}</h3>
            <a href="#" class="recipe-btn">Get Recipe</a>
          </div>
        </div>
      `;
          });
          mealList.classList.remove("notFound");
          mealList.innerHTML = html; // Set the meal results here
        } else {
          checkSimilarIngredients(searchInputTxt)
            .then((suggestions) => {
              if (suggestions.length > 0) {
                let suggestionHtml = `<p>Did you mean one of the following ingredients?</p>`;
                suggestions.forEach((suggestion) => {
                  suggestionHtml += `<p>${suggestion}</p>`;
                });
                mealList.innerHTML = suggestionHtml; // Show suggestions if available
              } else {
                html = "Sorry, we didn't find any meal!";
                mealList.innerHTML = html; // Show no results found message
              }
              mealList.classList.add("notFound");
            })
            .catch((error) => {
              console.error("Error checking for similar ingredients:", error);
              alert(
                "An error occurred while checking for similar ingredients."
              );
            });
        }
      })
      .catch((error) => {
        console.error("Error fetching data from the API:", error);
        alert(
          "An error occurred while fetching data from the API. Please try again later."
        );
      });
  }

  function checkSimilarIngredients(enteredIngredient) {
    return fetch(`https://www.themealdb.com/api/json/v1/1/list.php?i=list`)
      .then((response) => response.json())
      .then((data) => {
        const availableIngredients = data.meals.map(
          (meal) => meal.strIngredient
        );
        const similarIngredients = availableIngredients.filter((ingredient) =>
          ingredient.toLowerCase().includes(enteredIngredient.toLowerCase())
        );
        return similarIngredients;
      });
  }

  function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains("recipe-btn")) {
      let mealItem = e.target.parentElement.parentElement;
      fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch recipe data from the API.");
          }
          return response.json();
        })
        .then((data) => {
          if (data.meals && data.meals.length > 0) {
            mealRecipeModal(data.meals);
          } else {
            alert("Recipe data not found for the selected meal.");
          }
        })
        .catch((error) => {
          console.error("Error fetching recipe data from the API:", error);
          alert(
            "An error occurred while fetching recipe data from the API. Please try again later."
          );
        });
    }
  }

  function mealRecipeModal(meal) {
    meal = meal[0];
    let html = `
          <h2 class="recipe-title">${meal.strMeal}</h2>
          <p class="recipe-category">${meal.strCategory}</p>
          <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
          </div>
          <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
          </div>
          <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
          </div>
        `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add("showRecipe");
  }
});
