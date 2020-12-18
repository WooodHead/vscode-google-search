const EXT_NAME = "googleSearch";
const CONF_KEY = "QueryPrefix";

const vscode = require("vscode");

function activate (context) {
  const disposable1 = vscode.commands.registerTextEditorCommand(
    'extension.googleSearch',
    webSearch
  );

  const disposable2 = vscode.commands.registerTextEditorCommand(
    'extension.googleSearchByLanguage',
    webSearchByLanguage.bind(this, context)
  );


  const disposable3 = vscode.commands.registerTextEditorCommand(
    'extension.googleSearchWithKeywords',
    webSearchWithWeywords.bind(this, context)
  );


  const disposable4 = vscode.commands.registerTextEditorCommand(
    'extension.googleSearchWithKeywordsSaved',
    webSearchWithWeywordsSaved.bind(this, context)
  );
  context.subscriptions.push(disposable1);
  context.subscriptions.push(disposable2);
  context.subscriptions.push(disposable3);
  context.subscriptions.push(disposable4);
}
exports.activate = activate;

function deactivate () { }
exports.deactivate = deactivate;

function webSearch () {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return;
  }
  const uriText = encodeURI(selectedText);
  const vscodeGoogleSearchCfg = vscode.workspace.getConfiguration(EXT_NAME);
  const queryTemplate = vscodeGoogleSearchCfg.get(CONF_KEY);
  const query = queryTemplate.replace("%SELECTION%", uriText);
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(query));
}
function webSearchByLanguage (ctx) {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return;
  }
  const LanguageMapping = {
    typescript: 'javascript',
    less: 'css',
    sass: 'css',
    scss: 'css',
  }
  const languageId = vscode.window.activeTextEditor.document.languageId;
  const language = LanguageMapping[languageId] || languageId;
  const uriText = encodeURI(`${selectedText} ${language}`);
  const googleSearchCfg = vscode.workspace.getConfiguration(EXT_NAME);
  const queryTemplate = googleSearchCfg.get(CONF_KEY);
  const query = queryTemplate.replace("%SELECTION%", uriText);
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(query));
}


function webSearchWithWeywords (ctx) {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return;
  }
  const LanguageMapping = {
    typescript: 'javascript',
    less: 'css',
    sass: 'css',
    scss: 'css',
  }
  const languageId = vscode.window.activeTextEditor.document.languageId;
  const language = LanguageMapping[languageId] || languageId;
  const lastInput = ctx.globalState.get("lastInput", "") || language

  showInputBox(selectedText, lastInput)
    .then((text) => {
      function escapeRegExp (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      }
      const regex = new RegExp(`^${escapeRegExp(selectedText)} `)
      ctx.globalState.update("lastInput", text.replace(regex, ''));
      const uriText = encodeURI(`${text}`);
      const googleSearchCfg = vscode.workspace.getConfiguration(EXT_NAME);
      const queryTemplate = googleSearchCfg.get(CONF_KEY);
      const query = queryTemplate.replace("%SELECTION%", uriText);
      vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(query));
    })
    .catch(error => {
      console.error(error);
    });
}

function webSearchWithWeywordsSaved (ctx) {
  const selectedText = getSelectedText();
  if (!selectedText) {
    return;
  }
  const LanguageMapping = {
    typescript: 'javascript',
    less: 'css',
    sass: 'css',
    scss: 'css',
  }
  const languageId = vscode.window.activeTextEditor.document.languageId;
  const language = LanguageMapping[languageId] || languageId;
  const lastInput = ctx.globalState.get("lastInput", "") || language

  const uriText = encodeURI(`${selectedText} ${lastInput}`);
  const googleSearchCfg = vscode.workspace.getConfiguration(EXT_NAME);
  const queryTemplate = googleSearchCfg.get(CONF_KEY);
  const query = queryTemplate.replace("%SELECTION%", uriText);
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(query));
}

function getSelectedText () {
  const documentText = vscode.window.activeTextEditor.document.getText();
  if (!documentText) {
    return "";
  }
  const activeSelection = vscode.window.activeTextEditor.selection;
  if (activeSelection.isEmpty) {
    return "";
  }
  const selStartoffset = vscode.window.activeTextEditor.document.offsetAt(
    activeSelection.start
  );
  const selEndOffset = vscode.window.activeTextEditor.document.offsetAt(
    activeSelection.end
  );

  let selectedText = documentText.slice(selStartoffset, selEndOffset).trim();
  return selectedText.replace(/\s\s+/g, " ");
}

function showInputBox (selectedText, lastInput) {
  return new Promise((resolve, reject) => {
    vscode.window.showInputBox({
      value: `${selectedText} ${lastInput}`,
      valueSelection: [selectedText.length + 1, selectedText.length + lastInput.length + 1],
    })
      .then((result) => {
        resolve(result)
      })
  });
}
