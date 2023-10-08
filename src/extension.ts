/**
 * @author Ali Gençay
 * https://github.com/gencay/chinamobile-codehelper
 *
 * @license
 * Copyright (c) 2022 - Present, Ali Gençay
 *
 * All rights reserved. Code licensed under the ISC license
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

import * as vscode from "vscode";
import ChatGptViewProvider from './chatgpt-view-provider';

const menuCommands = ["explain"];
// const menuCommands = ["addTests", "findProblems", "optimize", "explain", "addComments", "completeCode", "generateCode", "customPrompt1", "customPrompt2", "adhoc"];


export async function activate(context: vscode.ExtensionContext) {
	let adhocCommandPrefix: string = context.globalState.get("chatgpt-adhoc-prompt") || '';

	const provider = new ChatGptViewProvider(context);

	const view = vscode.window.registerWebviewViewProvider(
		"chinamobile-codehelper.view",
		provider,
		{
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		}
	);

	const freeText = vscode.commands.registerCommand("chinamobile-codehelper.freeText", async () => {
		const value = await vscode.window.showInputBox({
			prompt: "Ask anything...",
		});

		if (value) {
			provider?.sendApiRequest(value, { command: "freeText" });
		}
	});

	const resetThread = vscode.commands.registerCommand("chinamobile-codehelper.clearConversation", async () => {
		provider?.sendMessage({ type: 'clearConversation' }, true);
	});

	const exportConversation = vscode.commands.registerCommand("chinamobile-codehelper.exportConversation", async () => {
		provider?.sendMessage({ type: 'exportConversation' }, true);
	});

	const clearSession = vscode.commands.registerCommand("chinamobile-codehelper.clearSession", () => {
		context.globalState.update("chatgpt-session-token", null);
		context.globalState.update("chatgpt-clearance-token", null);
		context.globalState.update("chatgpt-user-agent", null);
		context.globalState.update("chatgpt-gpt3-apiKey", null);
		provider?.clearSession();
	});

	const configChanged = vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('chinamobile-codehelper.response.showNotification')) {
			provider.subscribeToResponse = vscode.workspace.getConfiguration("chinamobile-codehelper").get("response.showNotification") || false;
		}

		if (e.affectsConfiguration('chinamobile-codehelper.response.autoScroll')) {
			provider.autoScroll = !!vscode.workspace.getConfiguration("chinamobile-codehelper").get("response.autoScroll");
		}

		if (e.affectsConfiguration('chinamobile-codehelper.useAutoLogin')) {
			provider.useAutoLogin = vscode.workspace.getConfiguration("chinamobile-codehelper").get("useAutoLogin") || false;

			context.globalState.update("chatgpt-session-token", null);
			context.globalState.update("chatgpt-clearance-token", null);
			context.globalState.update("chatgpt-user-agent", null);
		}

		if (e.affectsConfiguration('chinamobile-codehelper.chromiumPath')) {
			provider.setChromeExecutablePath();
		}

		if (e.affectsConfiguration('chinamobile-codehelper.profilePath')) {
			provider.setProfilePath();
		}

		if (e.affectsConfiguration('chinamobile-codehelper.proxyServer')) {
			provider.setProxyServer();
		}

		if (e.affectsConfiguration('chinamobile-codehelper.method')) {
			provider.setMethod();
		}

		if (e.affectsConfiguration('chinamobile-codehelper.authenticationType')) {
			provider.setAuthType();
		}

		if (e.affectsConfiguration('chinamobile-codehelper.gpt3.model')) {
			provider.model = vscode.workspace.getConfiguration("chinamobile-codehelper").get("gpt3.model");
		}

		if (e.affectsConfiguration('chinamobile-codehelper.gpt3.apiBaseUrl')
			|| e.affectsConfiguration('chinamobile-codehelper.gpt3.model')
			|| e.affectsConfiguration('chinamobile-codehelper.gpt3.organization')
			|| e.affectsConfiguration('chinamobile-codehelper.gpt3.maxTokens')
			|| e.affectsConfiguration('chinamobile-codehelper.gpt3.temperature')
			|| e.affectsConfiguration('chinamobile-codehelper.gpt3.top_p')) {
			provider.prepareConversation(true);
		}

		if (e.affectsConfiguration('chinamobile-codehelper.promptPrefix') || e.affectsConfiguration('chinamobile-codehelper.gpt3.generateCode-enabled') || e.affectsConfiguration('chinamobile-codehelper.gpt3.model') || e.affectsConfiguration('chinamobile-codehelper.method')) {
			setContext();
		}
	});

	const adhocCommand = vscode.commands.registerCommand("chinamobile-codehelper.adhoc", async () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const selection = editor.document.getText(editor.selection);
		let dismissed = false;
		if (selection) {
			await vscode.window
				.showInputBox({
					title: "Add prefix to your ad-hoc command",
					prompt: "Prefix your code with your custom prompt. i.e. Explain this",
					ignoreFocusOut: true,
					placeHolder: "Ask anything...",
					value: adhocCommandPrefix
				})
				.then((value) => {
					if (!value) {
						dismissed = true;
						return;
					}

					adhocCommandPrefix = value.trim() || '';
					context.globalState.update("chatgpt-adhoc-prompt", adhocCommandPrefix);
				});

			if (!dismissed && adhocCommandPrefix?.length > 0) {
				provider?.sendApiRequest(adhocCommandPrefix, { command: "adhoc", code: selection });
			}
		}
	});

	const generateCodeCommand = vscode.commands.registerCommand(`chinamobile-codehelper.generateCode`, () => {
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		const selection = editor.document.getText(editor.selection);
		if (selection) {
			provider?.sendApiRequest(selection, { command: "generateCode", language: editor.document.languageId });
		}
	});

	// Skip AdHoc - as it was registered earlier
	const registeredCommands = menuCommands.filter(command => command !== "adhoc" && command !== "generateCode").map((command) => vscode.commands.registerCommand(`chinamobile-codehelper.${command}`, () => {
		const prompt = vscode.workspace.getConfiguration("chinamobile-codehelper").get<string>(`promptPrefix.${command}`);
		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}
		console.log('右键菜单点击');
		const selection = editor.document.getText(editor.selection);
		if (selection && prompt) {
			// provider?.sendApiRequest(prompt, { command, code: selection, language: editor.document.languageId });
			provider?.sendApiRequestToYiYan(prompt + selection, { command });
		}
	}));

	context.subscriptions.push(view, freeText, resetThread, exportConversation, clearSession, configChanged, adhocCommand, generateCodeCommand, ...registeredCommands);

	const setContext = () => {
		menuCommands.forEach(command => {
			if (command === "generateCode") {
				let generateCodeEnabled = !!vscode.workspace.getConfiguration("chinamobile-codehelper").get<boolean>("gpt3.generateCode-enabled");
				const modelName = vscode.workspace.getConfiguration("chinamobile-codehelper").get("gpt3.model") as string;
				const method = vscode.workspace.getConfiguration("chinamobile-codehelper").get("method") as string;
				generateCodeEnabled = generateCodeEnabled && method === "GPT3 OpenAI API Key" && modelName.startsWith("code-");
				vscode.commands.executeCommand('setContext', "generateCode-enabled", generateCodeEnabled);
			} else {
				const enabled = !!vscode.workspace.getConfiguration("chinamobile-codehelper.promptPrefix").get<boolean>(`${command}-enabled`);
				vscode.commands.executeCommand('setContext', `${command}-enabled`, enabled);
			}
		});
	};

	setContext();
}

export function deactivate() { }
