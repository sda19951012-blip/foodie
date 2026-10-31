"use strict";

const recipeSelect = document.querySelector("#recipe-select");
const ingredientRows = document.querySelector("#ingredient-rows");
const ingredientCount = document.querySelector("#ingredient-count");
const ingredientsContent = document.querySelector("#ingredients-content");
const statusMessage = document.querySelector("#status-message");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("The recipe data contains an unfinished quoted field.");
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  if (rows.length < 2) throw new Error("No recipes were found in the recipe data.");
  const headers = rows[0].map((header) => header.trim());
  const recipeColumn = headers.indexOf("recipe");
  if (recipeColumn === -1) throw new Error("The recipe data is missing its recipe column.");

  const recipes = rows.slice(1).map((cells, rowIndex) => {
    if (cells.length !== headers.length) {
      throw new Error(`Recipe row ${rowIndex + 2} has an unexpected number of columns.`);
    }
    const recipeName = cells[recipeColumn].trim();
    if (!recipeName) throw new Error(`Recipe row ${rowIndex + 2} has no name.`);
    return {
      name: recipeName,
      ingredients: headers.flatMap((header, columnIndex) => {
        if (columnIndex === recipeColumn) return [];
        const rawAmount = cells[columnIndex].trim();
        const amount = Number(rawAmount);
        return rawAmount !== "" && Number.isFinite(amount) && amount > 0
          ? [{ name: header, amount: String(amount) }]
          : [];
      }),
    };
  });

  return recipes;
}

function displayName(name) {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function showRecipe(recipes) {
  const recipe = recipes[Number(recipeSelect.value)];
  ingredientRows.replaceChildren();

  if (!recipe || recipe.ingredients.length === 0) {
    ingredientCount.textContent = "0 ingredients";
    statusMessage.textContent = "This recipe has no ingredients with a positive amount.";
    ingredientsContent.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const ingredient of recipe.ingredients) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const amountCell = document.createElement("td");
    nameCell.textContent = displayName(ingredient.name);
    amountCell.textContent = ingredient.amount;
    row.append(nameCell, amountCell);
    fragment.append(row);
  }

  ingredientRows.append(fragment);
  ingredientCount.textContent = `${recipe.ingredients.length} ${recipe.ingredients.length === 1 ? "ingredient" : "ingredients"}`;
  statusMessage.textContent = "";
  ingredientsContent.hidden = false;
}

function showError(error) {
  recipeSelect.disabled = true;
  statusMessage.classList.add("is-error");
  statusMessage.textContent = `We couldn't load the recipes. ${error.message}`;
}

async function loadRecipes() {
  const response = await fetch("./recipes.csv");
  if (!response.ok) throw new Error(`The recipe file returned ${response.status}.`);
  const recipes = parseCsv(await response.text());

  recipeSelect.replaceChildren();
  recipes.forEach((recipe, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = displayName(recipe.name);
    recipeSelect.append(option);
  });

  recipeSelect.disabled = false;
  recipeSelect.addEventListener("change", () => showRecipe(recipes));
  showRecipe(recipes);
}

loadRecipes().catch(showError);
