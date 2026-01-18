/**
 * Example: GAS Tasks Server-Side
 *
 * Part of @shared/translation-manager examples.
 */

/**
 * The function name specified in 'gasTranslationFunction' on the client.
 * must be a top-level function.
 */
function translateTask(taskId, targetLang) {
  // Mock logic: In a real app, fetch from database or API
  const task = {
    title: "Review project proposal",
    notes: "Detailed review of the upcoming architecture changes."
  };

  try {
    return {
      title: LanguageApp.translate(task.title, 'en', targetLang),
      description: LanguageApp.translate(task.notes, 'en', targetLang)
    };
  } catch (e) {
    throw new Error("Translation service currently unavailable");
  }
}

/**
 * Standard GAS doGet entry point
 */
function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate()
      .setTitle('Translate Tasks Example')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
