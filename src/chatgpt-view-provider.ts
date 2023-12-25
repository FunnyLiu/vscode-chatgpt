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

import delay from 'delay';
import fetch from 'isomorphic-fetch';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as vscode from 'vscode';
import { ChatGPTAPI as ChatGPTAPI3 } from '../chatgpt-4.7.2/index';
import { ChatGPTAPI as ChatGPTAPI35 } from '../chatgpt-5.1.1/index';

type LoginMethod = "GPT3 OpenAI API Key";
type AuthType = "";

export default class ChatGptViewProvider implements vscode.WebviewViewProvider {
	private webView?: vscode.WebviewView;

	public subscribeToResponse: boolean;
	public autoScroll: boolean;
	public useAutoLogin?: boolean;
	public useGpt3?: boolean;
	public chromiumPath?: string;
	public profilePath?: string;
	public model?: string;
	public aiType: string;
	public glm2ApiServer: string;
	public glm3ApiServer: string;
	public yiyanAK: string;
	public yiyanSK: string;
	public azureSK: string;
	public azureUrl: string;
	public forceClear: boolean;

	private apiGpt3?: ChatGPTAPI3;
	private apiGpt35?: ChatGPTAPI35;
	private conversationId?: string;
	private conversations: any[] = [];
	private messageId?: string;
	private proxyServer?: string;
	private loginMethod?: LoginMethod;
	private authType?: AuthType;

	private questionCounter: number = 0;
	private inProgress: boolean = false;
	private abortController?: AbortController;
	private currentMessageId: string = "";
	private response: string = "";

	private prefixPrompt: string = "";

	/**
	 * Message to be rendered lazily if they haven't been rendered
	 * in time before resolveWebviewView is called.
	 */
	private leftOverMessage?: any;
	constructor(private context: vscode.ExtensionContext) {
		this.subscribeToResponse = vscode.workspace.getConfiguration("chinamobile-codehelper").get("response.showNotification") || false;
		this.autoScroll = !!vscode.workspace.getConfiguration("chinamobile-codehelper").get("response.autoScroll");
		this.model = vscode.workspace.getConfiguration("chinamobile-codehelper").get("gpt3.model") as string;
		this.aiType = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.aiType") || 'glm2';
		this.glm2ApiServer = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.glm2ApiServer") || "http://47.100.220.105:32002";
		this.glm3ApiServer = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.glm3ApiServer") || "http://10.73.10.3:13004";
		this.yiyanAK = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.yiyanAK") || "";
		this.yiyanSK = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.yiyanSK") || "";
		this.azureSK = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.azureSK") || "";
		this.azureUrl = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.azureUrl") || "";
		this.forceClear = vscode.workspace.getConfiguration("chinamobile-codehelper").get("promptPrefix.forceClear") || false;

		this.setMethod();
		this.setChromeExecutablePath();
		this.setProfilePath();
		this.setProxyServer();
		this.setAuthType();
	}
	// vscode物理上取消选中
	public clearSelection() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const position = editor.selection.active;
			const newSelection = new vscode.Selection(position, position);
			editor.selection = newSelection;
		}
	}
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this.webView = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this.context.extensionUri
			]
		};

		webviewView.webview.html = this.getWebviewHtml(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'addFreeTextQuestion':
					console.log('this.aiType');
					console.log(this.aiType);
					// this.sendApiRequest(data.value, { command: "freeText" });
					if (this.aiType == 'glm2') {
						this.sendApiRequestToSelfGLM2(data.value, { command: "freeText" });
					} else if (this.aiType == 'glm3') {
						this.sendApiRequestToSelfGLM3(data.value, { command: "freeText" });
					} else if (this.aiType == 'yiyan' || this.aiType == 'yiyanpro') {
						this.sendApiRequestToYiYan(data.value, { command: "freeText", aiType: this.aiType });
					} else if (this.aiType == 'azure') {
						this.sendApiRequestToAzure(data.value, { command: "freeText" });
					}
					// this.sendApiRequestToYiYan(data.value, { command: "freeText" });
					// this.sendApiRequestToSelfGLM2(data.value, { command: "freeText" });
					break;
				case 'editCode':
					const escapedString = (data.value as string).replace(/\$/g, '\\$');;
					vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(escapedString));

					this.logEvent("code-inserted");
					break;
				case 'openNew':
					const document = await vscode.workspace.openTextDocument({
						content: data.value,
						language: data.language
					});
					vscode.window.showTextDocument(document);

					this.logEvent(data.language === "markdown" ? "code-exported" : "code-opened");
					break;
				case 'clearConversation':
					this.messageId = undefined;
					this.conversationId = undefined;
					this.conversations = [];
					this.logEvent("conversation-cleared");
					break;
				case 'clearBrowser':
					this.logEvent("browser-cleared");
					break;
				case 'cleargpt3':
					this.apiGpt3 = undefined;

					this.logEvent("gpt3-cleared");
					break;
				case 'login':
					this.prepareConversation().then(success => {
						if (success) {
							this.sendMessage({ type: 'loginSuccessful', showConversations: this.useAutoLogin }, true);

							this.logEvent("logged-in");
						}
					});
					break;
				case 'openSettings':
					vscode.commands.executeCommand('workbench.action.openSettings', "@ext:myCodeHelper.chinamobile-codehelper chinamobile-codehelper.");

					this.logEvent("settings-opened");
					break;
				case 'openSettingsPrompt':
					vscode.commands.executeCommand('workbench.action.openSettings', "@ext:myCodeHelper.chinamobile-codehelper promptPrefix");

					this.logEvent("settings-prompt-opened");
					break;
				case 'showConversation':
					/// ...
					break;
				case "stopGenerating":
					this.stopGenerating();
					break;
				case "cancelSelect":
					this.clearSelection();
					this.prefixPrompt = "";
					// this.selectionChanged("");
					break;
				default:
					break;
			}
		});

		if (this.leftOverMessage != null) {
			// If there were any messages that wasn't delivered, render after resolveWebView is called.
			this.sendMessage(this.leftOverMessage);
			this.leftOverMessage = null;
		}
	}

	private stopGenerating(): void {
		this.abortController?.abort?.();
		this.inProgress = false;
		this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
		const responseInMarkdown = !this.isCodexModel;
		this.sendMessage({ type: 'addResponse', value: this.response, done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
		this.logEvent("stopped-generating");
	}

	public clearSession(): void {
		this.stopGenerating();
		this.apiGpt3 = undefined;
		this.messageId = undefined;
		this.conversationId = undefined;
		this.logEvent("cleared-session");
	}

	public setProxyServer(): void {
		this.proxyServer = vscode.workspace.getConfiguration("chinamobile-codehelper").get("proxyServer");
	}

	public setMethod(): void {
		this.loginMethod = vscode.workspace.getConfiguration("chinamobile-codehelper").get("method") as LoginMethod;

		this.useGpt3 = true;
		this.useAutoLogin = false;
		this.clearSession();
	}

	public setAuthType(): void {
		this.authType = vscode.workspace.getConfiguration("chinamobile-codehelper").get("authenticationType");
		this.clearSession();
	}

	public setChromeExecutablePath(): void {
		let path = "";
		switch (os.platform()) {
			case 'win32':
				path = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
				break;

			case 'darwin':
				path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
				break;

			default:
				/**
				 * Since two (2) separate chrome releases exists on linux
				 * we first do a check to ensure we're executing the right one.
				 */
				const chromeExists = fs.existsSync('/usr/bin/google-chrome');

				path = chromeExists
					? '/usr/bin/google-chrome'
					: '/usr/bin/google-chrome-stable';
				break;
		}

		this.chromiumPath = vscode.workspace.getConfiguration("chinamobile-codehelper").get("chromiumPath") || path;
		this.clearSession();
	}

	public setProfilePath(): void {
		this.profilePath = vscode.workspace.getConfiguration("chinamobile-codehelper").get("profilePath");
		this.clearSession();
	}

	private get isCodexModel(): boolean {
		return !!this.model?.startsWith("code-");
	}

	private get isGpt35Model(): boolean {
		return !!this.model?.startsWith("gpt-");
	}

	public async prepareConversation(modelChanged = false): Promise<boolean> {
		if (modelChanged && this.useAutoLogin) {
			// no need to reinitialize in autologin when model changes
			return false;
		}

		const state = this.context.globalState;
		const configuration = vscode.workspace.getConfiguration("chinamobile-codehelper");

		if (this.useGpt3) {
			if ((this.isGpt35Model && !this.apiGpt35) || (!this.isGpt35Model && !this.apiGpt3) || modelChanged) {
				let apiKey = configuration.get("gpt3.apiKey") as string || state.get("chatgpt-gpt3-apiKey") as string;
				const organization = configuration.get("gpt3.organization") as string;
				const max_tokens = configuration.get("gpt3.maxTokens") as number;
				const temperature = configuration.get("gpt3.temperature") as number;
				const top_p = configuration.get("gpt3.top_p") as number;
				const apiBaseUrl = configuration.get("gpt3.apiBaseUrl") as string;

				if (!apiKey) {
					vscode.window.showErrorMessage("Please add your API Key to use OpenAI official APIs. Storing the API Key in Settings is discouraged due to security reasons, though you can still opt-in to use it to persist it in settings. Instead you can also temporarily set the API Key one-time: You will need to re-enter after restarting the vs-code.", "Store in session (Recommended)", "Open settings").then(async choice => {
						if (choice === "Open settings") {
							vscode.commands.executeCommand('workbench.action.openSettings', "chinamobile-codehelper.gpt3.apiKey");
							return false;
						} else if (choice === "Store in session (Recommended)") {
							await vscode.window
								.showInputBox({
									title: "Store OpenAI API Key in session",
									prompt: "Please enter your OpenAI API Key to store in your session only. This option won't persist the token on your settings.json file. You may need to re-enter after restarting your VS-Code",
									ignoreFocusOut: true,
									placeHolder: "API Key",
									value: apiKey || ""
								})
								.then((value) => {
									if (value) {
										apiKey = value;
										state.update("chatgpt-gpt3-apiKey", apiKey);
										this.sendMessage({ type: 'loginSuccessful', showConversations: this.useAutoLogin }, true);
									}
								});
						}
					});

					return false;
				}

				if (this.isGpt35Model) {
					this.apiGpt35 = new ChatGPTAPI35({
						apiKey,
						fetch: fetch,
						apiBaseUrl: apiBaseUrl?.trim() || undefined,
						organization,
						completionParams: {
							model: this.model,
							max_tokens,
							temperature,
							top_p,
						}
					});
				} else {
					this.apiGpt3 = new ChatGPTAPI3({
						apiKey,
						fetch: fetch,
						apiBaseUrl: apiBaseUrl?.trim() || undefined,
						organization,
						completionParams: {
							model: this.model,
							max_tokens,
							temperature,
							top_p,
						}
					});
				}
			}
		}

		this.sendMessage({ type: 'loginSuccessful', showConversations: this.useAutoLogin }, true);

		return true;
	}

	private get systemContext() {
		return `You are ChatGPT helping the User with pair programming.`;
	}

	public selectionChanged(selection: string) {
		console.log(selection, 'selection');
		if (selection) {
			this.prefixPrompt = `请针对以下内容:${selection}进行讨论，讨论内容是：`;
		} else {
			this.prefixPrompt = "";
		}
		this.sendMessage({
			type: 'selectionChanged',
			content: selection
		}, true);
	}
	private processQuestion(question: string, code?: string, language?: string) {
		if (code != null) {
			// Add prompt prefix to the code if there was a code block selected
			question = `${question}${language ? ` (The following code is in ${language} programming language)` : ''}: ${code}`;
		}
		return question + "\r\n";
	}

	public async sendApiRequest(prompt: string, options: { command: string, code?: string, previousAnswer?: string, language?: string; }) {
		if (this.inProgress) {
			// The AI is still thinking... Do not accept more questions.
			return;
		}

		this.questionCounter++;

		this.logEvent("api-request-sent", { "chinamobile-codehelper.command": options.command, "chinamobile-codehelper.hasCode": String(!!options.code), "chinamobile-codehelper.hasPreviousAnswer": String(!!options.previousAnswer) });

		if (!await this.prepareConversation()) {
			return;
		}

		this.response = '';
		let question = this.processQuestion(prompt, options.code, options.language);
		const responseInMarkdown = !this.isCodexModel;

		// If the ChatGPT view is not in focus/visible; focus on it to render Q&A
		if (this.webView == null) {
			vscode.commands.executeCommand('chinamobile-codehelper.view.focus');
		} else {
			this.webView?.show?.(true);
		}

		this.inProgress = true;
		this.abortController = new AbortController();
		this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress, showStopButton: this.useGpt3 });
		this.currentMessageId = this.getRandomId();

		this.sendMessage({ type: 'addQuestion', value: prompt, code: options.code, autoScroll: this.autoScroll });

		try {
			if (this.useGpt3) {
				if (this.isGpt35Model && this.apiGpt35) {
					const gpt3Response = await this.apiGpt35.sendMessage(question, {
						systemMessage: this.systemContext,
						messageId: this.conversationId,
						parentMessageId: this.messageId,
						abortSignal: this.abortController.signal,
						onProgress: (partialResponse) => {
							this.response = partialResponse.text;
							this.sendMessage({ type: 'addResponse', value: this.response, id: this.conversationId, autoScroll: this.autoScroll, responseInMarkdown });
						},
					});
					({ text: this.response, id: this.conversationId, parentMessageId: this.messageId } = gpt3Response);
				} else if (!this.isGpt35Model && this.apiGpt3) {
					({ text: this.response, conversationId: this.conversationId, parentMessageId: this.messageId } = await this.apiGpt3.sendMessage(question, {
						promptPrefix: this.systemContext,
						messageId: this.conversationId,
						parentMessageId: this.messageId,
						abortSignal: this.abortController.signal,
						onProgress: (partialResponse) => {
							this.response = partialResponse.text;
							this.sendMessage({ type: 'addResponse', value: this.response, id: this.messageId, autoScroll: this.autoScroll, responseInMarkdown });
						},
					}));
				}
			}

			if (options.previousAnswer != null) {
				this.response = options.previousAnswer + this.response;
			}

			const hasContinuation = ((this.response.split("```").length) % 2) === 1;

			if (hasContinuation) {
				this.response = this.response + " \r\n ```\r\n";
				vscode.window.showInformationMessage("It looks like ChatGPT didn't complete their answer for your coding question. You can ask it to continue and combine the answers.", "Continue and combine answers")
					.then(async (choice) => {
						if (choice === "Continue and combine answers") {
							this.sendApiRequest("Continue", { command: options.command, code: undefined, previousAnswer: this.response });
						}
					});
			}

			this.sendMessage({ type: 'addResponse', value: this.response, done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });

			if (this.subscribeToResponse) {
				vscode.window.showInformationMessage("ChatGPT responded to your question.", "Open conversation").then(async () => {
					await vscode.commands.executeCommand('chinamobile-codehelper.view.focus');
				});
			}
		} catch (error: any) {
			let message;
			let apiMessage = error?.response?.data?.error?.message || error?.tostring?.() || error?.message || error?.name;

			this.logError("api-request-failed");

			if (error?.response?.status || error?.response?.statusText) {
				message = `${error?.response?.status || ""} ${error?.response?.statusText || ""}`;

				vscode.window.showErrorMessage("An error occured. If this is due to max_token you could try `ChatGPT: Clear Conversation` command and retry sending your prompt.", "Clear conversation and retry").then(async choice => {
					if (choice === "Clear conversation and retry") {
						await vscode.commands.executeCommand("chinamobile-codehelper.clearConversation");
						await delay(250);
						this.sendApiRequest(prompt, { command: options.command, code: options.code });
					}
				});
			} else if (error.statusCode === 400) {
				message = `Your method: '${this.loginMethod}' and your model: '${this.model}' may be incompatible or one of your parameters is unknown. Reset your settings to default. (HTTP 400 Bad Request)`;

			} else if (error.statusCode === 401) {
				message = 'Make sure you are properly signed in. If you are using Browser Auto-login method, make sure the browser is open (You could refresh the browser tab manually if you face any issues, too). If you stored your API key in settings.json, make sure it is accurate. If you stored API key in session, you can reset it with `ChatGPT: Reset session` command. (HTTP 401 Unauthorized) Potential reasons: \r\n- 1.Invalid Authentication\r\n- 2.Incorrect API key provided.\r\n- 3.Incorrect Organization provided. \r\n See https://platform.openai.com/docs/guides/error-codes for more details.';
			} else if (error.statusCode === 403) {
				message = 'Your token has expired. Please try authenticating again. (HTTP 403 Forbidden)';
			} else if (error.statusCode === 404) {
				message = `Your method: '${this.loginMethod}' and your model: '${this.model}' may be incompatible or you may have exhausted your ChatGPT subscription allowance. (HTTP 404 Not Found)`;
			} else if (error.statusCode === 429) {
				message = "Too many requests try again later. (HTTP 429 Too Many Requests) Potential reasons: \r\n 1. You exceeded your current quota, please check your plan and billing details\r\n 2. You are sending requests too quickly \r\n 3. The engine is currently overloaded, please try again later. \r\n See https://platform.openai.com/docs/guides/error-codes for more details.";
			} else if (error.statusCode === 500) {
				message = "The server had an error while processing your request, please try again. (HTTP 500 Internal Server Error)\r\n See https://platform.openai.com/docs/guides/error-codes for more details.";
			}

			if (apiMessage) {
				message = `${message ? message + " " : ""}

	${apiMessage}
`;
			}

			this.sendMessage({ type: 'addError', value: message, autoScroll: this.autoScroll });

			return;
		} finally {
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
		}
	}


	public async sendApiRequestToAzure(prompt: string, options: { command: string, code?: string, previousAnswer?: string, language?: string; }) {
		prompt = this.prefixPrompt + prompt;
		const SK = this.azureSK;
		const azureUri = this.azureUrl;
		if (this.inProgress) {
			// The AI is still thinking... Do not accept more questions.
			return;
		}

		this.questionCounter++;

		// this.logEvent("api-request-sent", { "chinamobile-codehelper.command": options.command, "chinamobile-codehelper.hasCode": String(!!options.code), "chinamobile-codehelper.hasPreviousAnswer": String(!!options.previousAnswer) });

		// if (!await this.prepareConversation()) {
		// 	return;
		// }

		this.response = '';
		const responseInMarkdown = !this.isCodexModel;

		// If the ChatGPT view is not in focus/visible; focus on it to render Q&A
		if (this.webView == null) {
			vscode.commands.executeCommand('chinamobile-codehelper.view.focus');
		} else {
			this.webView?.show?.(true);
		}

		this.inProgress = true;
		this.abortController = new AbortController();
		this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress, showStopButton: this.useGpt3 });
		this.currentMessageId = this.getRandomId();

		this.sendMessage({ type: 'addQuestion', value: prompt, code: options.code, autoScroll: this.autoScroll });
		if (prompt.length > 6000) {
			this.sendMessage({ type: 'addResponse', value: '内容太长，请精简后再对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			return;
		}
		const message = {
			"role": "user",
			"content": prompt
		};
		this.conversations.push(message);
		try {
			// const accessToken = await this.getAccessToken();
			console.log('conversations');
			console.log(this.conversations);
			const options2 = {
				method: 'POST',
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'application/json',
					'api-key': this.azureSK
				},
				body: JSON.stringify({
					"messages": this.conversations,
					"stream": false,
					"temperature": 0.7,
					"max_tokens": 800,
					"top_p": 1
				}),
				signal: this.abortController.signal // 将 signal 传递给 fetch 请求的选项中
			};
			// this.conversations.push(prompt);
			console.log('fecthinfo');
			console.log(this.azureUrl);
			console.log(options2);
			const response = await fetch(this.azureUrl, options2);
			const data = await response.json();
			console.log(data);
			if (data.choices.length === 0) {
				throw new Error('返回异常');
			}
			this.conversations.push(data.choices[0].message);
			this.sendMessage({ type: 'addResponse', value: data.choices[0].message.content, done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
			// this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			// 超过5轮对话就强制置空
			if (this.conversations.length >= 10) {
				if (this.forceClear) {
					this.conversations = [];
					this.sendMessage({ type: 'addResponse', value: '超出一轮对话聊天轮数，请重新开始对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
				} else {
					// 保留数组末尾的10个元素
					this.conversations = this.conversations.slice(-10);
				}
			}
		} catch (error: any) {
			console.log('error');
			console.log(error);
			this.conversations = [];
			this.sendMessage({ type: 'addResponse', value: '出现异常，请检查是否超出长度限制或联系管理员', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
		} finally {
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
		}
	}
	/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
	public async getAccessToken() {
		const AK = this.yiyanAK;
		const SK = this.yiyanSK;
		const options = {
			method: 'POST',
		};

		return fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${AK}&client_secret=${SK}`, options)
			.then(response => response.json())
			.then(data => data.access_token);
	}
	// 文心一言API
	public async sendApiRequestToYiYan(prompt: string, options: { command: string, code?: string, previousAnswer?: string, language?: string; aiType?: string; }) {
		prompt = this.prefixPrompt + prompt;
		if (this.inProgress) {
			// The AI is still thinking... Do not accept more questions.
			return;
		}

		this.questionCounter++;

		// this.logEvent("api-request-sent", { "chinamobile-codehelper.command": options.command, "chinamobile-codehelper.hasCode": String(!!options.code), "chinamobile-codehelper.hasPreviousAnswer": String(!!options.previousAnswer) });

		// if (!await this.prepareConversation()) {
		// 	return;
		// }

		this.response = '';
		let question = this.processQuestion(prompt, options.code, options.language);
		const responseInMarkdown = !this.isCodexModel;

		// If the ChatGPT view is not in focus/visible; focus on it to render Q&A
		if (this.webView == null) {
			vscode.commands.executeCommand('chinamobile-codehelper.view.focus');
		} else {
			this.webView?.show?.(true);
		}

		this.inProgress = true;
		this.abortController = new AbortController();
		this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress, showStopButton: this.useGpt3 });
		this.currentMessageId = this.getRandomId();

		this.sendMessage({ type: 'addQuestion', value: prompt, code: options.code, autoScroll: this.autoScroll });
		const message = {
			role: "user",
			content: prompt
		};
		this.conversations.push(message);
		try {
			const accessToken = await this.getAccessToken();
			const options2 = {
				method: 'POST',
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages: this.conversations,
					system: '你是中国移动公司自主研发的AI助手'
				}),
				signal: this.abortController.signal // 将 signal 传递给 fetch 请求的选项中
			};
			let requestStr = 'completions';
			if (options.aiType == 'yiyanpro') {
				requestStr = 'completions_pro';
			}
			const response = await fetch(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/${requestStr}?access_token=${accessToken}`, options2);
			const data = await response.json();
			console.log('yiyan');
			console.log(data);
			if (data.error_code == 336007) {
				throw new Error('超出最大长度限制');
			}
			this.conversations.push({
				role: "assistant",
				content: data.result
			});
			this.sendMessage({ type: 'addResponse', value: data.result, done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
			// this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			// 超过5轮对话就强制置空
			if (this.conversations.length >= 10) {
				if (this.forceClear) {
					this.conversations = [];
					this.sendMessage({ type: 'addResponse', value: '超出一轮对话聊天轮数，请重新开始对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
				} else {
					// 保留数组末尾的10个元素
					this.conversations = this.conversations.slice(-10);
				}
			}
		} catch (error: any) {
			console.log('error');
			console.log(error);
			this.conversations = [];
			this.sendMessage({ type: 'addResponse', value: '出现异常，请检查是否超出长度限制或联系管理员', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
		} finally {
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
		}
	}

	// 私有chatglm2的API
	public async sendApiRequestToSelfGLM2(prompt: string, options: { command: string, code?: string, previousAnswer?: string, language?: string; }) {
		prompt = this.prefixPrompt + prompt;
		if (this.inProgress) {
			// The AI is still thinking... Do not accept more questions.
			return;
		}

		this.questionCounter++;

		// this.logEvent("api-request-sent", { "chinamobile-codehelper.command": options.command, "chinamobile-codehelper.hasCode": String(!!options.code), "chinamobile-codehelper.hasPreviousAnswer": String(!!options.previousAnswer) });

		// if (!await this.prepareConversation()) {
		// 	return;
		// }

		this.response = '';
		const responseInMarkdown = !this.isCodexModel;

		// If the ChatGPT view is not in focus/visible; focus on it to render Q&A
		if (this.webView == null) {
			vscode.commands.executeCommand('chinamobile-codehelper.view.focus');
		} else {
			this.webView?.show?.(true);
		}

		this.inProgress = true;
		this.abortController = new AbortController();
		this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress, showStopButton: this.useGpt3 });
		this.currentMessageId = this.getRandomId();

		this.sendMessage({ type: 'addQuestion', value: prompt, code: options.code, autoScroll: this.autoScroll });
		if (prompt.length > 4000) {
			this.sendMessage({ type: 'addResponse', value: '内容太长，请精简后再对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			return;
		}
		try {
			// const accessToken = await this.getAccessToken();
			console.log('conversations');
			console.log(this.conversations);
			const options2 = {
				method: 'POST',
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: prompt,
					history: this.conversations
				}),
				signal: this.abortController.signal // 将 signal 传递给 fetch 请求的选项中
			};
			// this.conversations.push(prompt);
			console.log('fecthinfo');
			console.log(this.glm2ApiServer);
			console.log(options2);
			const response = await fetch(this.glm2ApiServer, options2);
			const data = await response.json();
			console.log('selfchatglm2');
			console.log(data);
			if (data.response == 'This') {
				throw new Error('超出最大长度限制');
			}
			this.conversations = (data.history);
			this.sendMessage({ type: 'addResponse', value: data.response, done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
			// this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			// 超过5轮对话就强制置空
			if (this.conversations.length >= 5) {
				if (this.forceClear) {
					this.conversations = [];
					this.sendMessage({ type: 'addResponse', value: '超出一轮对话聊天轮数，请重新开始对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
				} else {
					// 保留数组末尾的10个元素
					this.conversations = this.conversations.slice(-10);
				}
			}
		} catch (error: any) {
			console.log('error');
			console.log(error);
			this.conversations = [];
			this.sendMessage({ type: 'addResponse', value: '出现异常，请检查是否超出长度限制或联系管理员', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
		} finally {
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
		}
	}
	// 私有chatglm2的API
	public async sendApiRequestToSelfGLM3(prompt: string, options: { command: string, code?: string, previousAnswer?: string, language?: string; }) {
		if (this.inProgress) {
			// The AI is still thinking... Do not accept more questions.
			return;
		}
		prompt = this.prefixPrompt + prompt;
		this.questionCounter++;

		// this.logEvent("api-request-sent", { "chinamobile-codehelper.command": options.command, "chinamobile-codehelper.hasCode": String(!!options.code), "chinamobile-codehelper.hasPreviousAnswer": String(!!options.previousAnswer) });

		// if (!await this.prepareConversation()) {
		// 	return;
		// }

		this.response = '';
		const responseInMarkdown = !this.isCodexModel;

		// If the ChatGPT view is not in focus/visible; focus on it to render Q&A
		if (this.webView == null) {
			vscode.commands.executeCommand('chinamobile-codehelper.view.focus');
		} else {
			this.webView?.show?.(true);
		}

		this.inProgress = true;
		this.abortController = new AbortController();
		this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress, showStopButton: this.useGpt3 });
		this.currentMessageId = this.getRandomId();

		this.sendMessage({ type: 'addQuestion', value: prompt, code: options.code, autoScroll: this.autoScroll });
		if (prompt.length > 6000) {
			this.sendMessage({ type: 'addResponse', value: '内容太长，请精简后再对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			return;
		}
		const message = {
			"role": "user",
			"content": prompt,
			"metadata": "string",
			"tools": [
				{}
			]
		};
		this.conversations.push(message);
		try {
			// const accessToken = await this.getAccessToken();
			console.log('conversations');
			console.log(this.conversations);
			const options2 = {
				method: 'POST',
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					"model": "string",
					"messages": this.conversations,
					"temperature": 0.7,
					"top_p": 1,
					"max_tokens": 0,
					"stop": [
						"string"
					],
					"stream": false,
					"stop_token_ids": [
						0
					],
					"repetition_penalty": 1.1,
					"return_function_call": false
				}),
				signal: this.abortController.signal // 将 signal 传递给 fetch 请求的选项中
			};
			// this.conversations.push(prompt);
			console.log('fecthinfo');
			console.log(this.glm3ApiServer);
			console.log(options2);
			const response = await fetch(`${this.glm3ApiServer}/v1/chat/completions`, options2);
			const data = await response.json();
			console.log('selfchatglm3');
			console.log(data);
			if (data.choices.length === 0) {
				throw new Error('返回异常');
			}
			this.conversations.push(data.choices[0].message);
			this.sendMessage({ type: 'addResponse', value: data.choices[0].message.content, done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
			// this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
			// 超过5轮对话就强制置空
			if (this.conversations.length >= 10) {
				if (this.forceClear) {
					this.conversations = [];
					this.sendMessage({ type: 'addResponse', value: '超出一轮对话聊天轮数，请重新开始对话', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
				} else {
					// 保留数组末尾的10个元素
					this.conversations = this.conversations.slice(-10);
				}
			}
		} catch (error: any) {
			console.log('error');
			console.log(error);
			this.conversations = [];
			this.sendMessage({ type: 'addResponse', value: '出现异常，请检查是否超出长度限制或联系管理员', done: true, id: this.currentMessageId, autoScroll: this.autoScroll, responseInMarkdown });
			// this.inProgress = false;
		} finally {
			this.inProgress = false;
			this.sendMessage({ type: 'showInProgress', inProgress: this.inProgress });
		}
	}

	/**
	 * Message sender, stores if a message cannot be delivered
	 * @param message Message to be sent to WebView
	 * @param ignoreMessageIfNullWebView We will ignore the command if webView is null/not-focused
	 */
	public sendMessage(message: any, ignoreMessageIfNullWebView?: boolean) {
		if (this.webView) {
			this.webView?.webview.postMessage(message);
		} else if (!ignoreMessageIfNullWebView) {
			this.leftOverMessage = message;
		}
	}

	private logEvent(eventName: string, properties?: {}): void {
		// You can initialize your telemetry reporter and consume it here - *replaced with console.debug to prevent unwanted telemetry logs
		// this.reporter?.sendTelemetryEvent(eventName, { "chinamobile-codehelper.loginMethod": this.loginMethod!, "chinamobile-codehelper.authType": this.authType!, "chinamobile-codehelper.model": this.model || "unknown", ...properties }, { "chinamobile-codehelper.questionCounter": this.questionCounter });
		console.debug(eventName, { "chinamobile-codehelper.loginMethod": this.loginMethod!, "chinamobile-codehelper.authType": this.authType!, "chinamobile-codehelper.model": this.model || "unknown", ...properties }, { "chinamobile-codehelper.questionCounter": this.questionCounter });
	}

	private logError(eventName: string): void {
		// You can initialize your telemetry reporter and consume it here - *replaced with console.error to prevent unwanted telemetry logs
		// this.reporter?.sendTelemetryErrorEvent(eventName, { "chinamobile-codehelper.loginMethod": this.loginMethod!, "chinamobile-codehelper.authType": this.authType!, "chinamobile-codehelper.model": this.model || "unknown" }, { "chinamobile-codehelper.questionCounter": this.questionCounter });
		console.error(eventName, { "chinamobile-codehelper.loginMethod": this.loginMethod!, "chinamobile-codehelper.authType": this.authType!, "chinamobile-codehelper.model": this.model || "unknown" }, { "chinamobile-codehelper.questionCounter": this.questionCounter });
	}

	private getWebviewHtml(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'main.js'));
		const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'main.css'));

		const vendorHighlightCss = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'highlight.min.css'));
		const vendorHighlightJs = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'highlight.min.js'));
		const vendorMarkedJs = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'marked.min.js'));
		const vendorTailwindJs = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'tailwindcss.3.2.4.min.js'));
		const vendorTurndownJs = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vendor', 'turndown.js'));

		const nonce = this.getRandomId();
		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0" data-license="isc-gnc">

				<link href="${stylesMainUri}" rel="stylesheet">
				<link href="${vendorHighlightCss}" rel="stylesheet">
				<script src="${vendorHighlightJs}"></script>
				<script src="${vendorMarkedJs}"></script>
				<script src="${vendorTailwindJs}"></script>
				<script src="${vendorTurndownJs}"></script>
			</head>
			<body class="overflow-hidden">
				<div class="flex flex-col h-screen">
					<div id="introduction" class="flex flex-col justify-between h-full justify-center px-6 w-full relative login-screen overflow-auto">
						<div data-license="isc-gnc-hi-there" class="flex items-start text-center features-block my-5">
							<div class="flex flex-col gap-3.5 flex-1" style="align-items: center;">
					
								<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="32px" height="32px" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd" xmlns:xlink="http://www.w3.org/1999/xlink">
<g><path style="opacity:0.717" fill="#008dd4" d="M 11.5,-0.5 C 14.1667,-0.5 16.8333,-0.5 19.5,-0.5C 23.9301,2.98412 27.9301,6.98412 31.5,11.5C 31.5,12.5 31.5,13.5 31.5,14.5C 31.1667,14.5 30.8333,14.5 30.5,14.5C 29.8333,14.5 29.5,14.1667 29.5,13.5C 30.8333,13.1667 30.8333,12.8333 29.5,12.5C 29.5,11.8333 29.1667,11.5 28.5,11.5C 28.5,10.8333 28.1667,10.5 27.5,10.5C 27.5,9.83333 27.1667,9.5 26.5,9.5C 26.5,8.83333 26.1667,8.5 25.5,8.5C 25.5,7.83333 25.1667,7.5 24.5,7.5C 24.5,6.83333 24.1667,6.5 23.5,6.5C 23.5,5.83333 23.1667,5.5 22.5,5.5C 22.5,4.83333 22.1667,4.5 21.5,4.5C 21.1583,3.66175 20.4916,3.32842 19.5,3.5C 18.0536,2.38705 16.3869,2.22039 14.5,3C 10.6172,6.0983 6.61723,8.93164 2.5,11.5C 2.5,10.8333 2.16667,10.5 1.5,10.5C 1.38929,9.88258 1.05596,9.38258 0.5,9C 4.35904,5.96839 8.02571,2.80173 11.5,-0.5 Z"/></g>
<g><path style="opacity:0.833" fill="#018cd7" d="M 19.5,3.5 C 19.8417,4.33825 20.5084,4.67158 21.5,4.5C 22.1667,4.5 22.5,4.83333 22.5,5.5C 23.1667,5.5 23.5,5.83333 23.5,6.5C 24.1667,6.5 24.5,6.83333 24.5,7.5C 24.5,7.83333 24.5,8.16667 24.5,8.5C 23.8333,8.5 23.1667,8.5 22.5,8.5C 20.8632,7.78219 19.1966,7.61553 17.5,8C 14.0003,10.6686 10.667,13.502 7.5,16.5C 7.5,15.8333 7.16667,15.5 6.5,15.5C 6.5,14.8333 6.16667,14.5 5.5,14.5C 5.5,13.8333 5.16667,13.5 4.5,13.5C 7.60433,10.8991 10.6043,8.06575 13.5,5C 15.3453,3.87201 17.3453,3.37201 19.5,3.5 Z"/></g>
<g><path style="opacity:0.984" fill="#8fc73b" d="M 22.5,9.5 C 22.5,9.83333 22.5,10.1667 22.5,10.5C 22.5,11.5 22.5,12.5 22.5,13.5C 18.5421,16.2854 14.7088,19.2854 11,22.5C 10.3292,21.7476 9.4959,21.4142 8.5,21.5C 8.5,20.8333 8.16667,20.5 7.5,20.5C 7.5,20.1667 7.5,19.8333 7.5,19.5C 8.16667,18.8333 8.83333,18.1667 9.5,17.5C 12.2971,15.205 14.9638,12.705 17.5,10C 19.1341,9.50649 20.8008,9.33982 22.5,9.5 Z"/></g>
<g><path style="opacity:1" fill="#0487e4" d="M 22.5,9.5 C 22.5,9.16667 22.5,8.83333 22.5,8.5C 23.1667,8.5 23.8333,8.5 24.5,8.5C 24.8333,8.5 25.1667,8.5 25.5,8.5C 26.1667,8.5 26.5,8.83333 26.5,9.5C 27.1667,9.5 27.5,9.83333 27.5,10.5C 28.1667,10.5 28.5,10.8333 28.5,11.5C 29.1667,11.5 29.5,11.8333 29.5,12.5C 29.5,12.8333 29.5,13.1667 29.5,13.5C 29.5,14.1667 29.8333,14.5 30.5,14.5C 30.5,15.1667 30.8333,15.5 31.5,15.5C 31.5,16.1667 31.5,16.8333 31.5,17.5C 31.1667,17.5 30.8333,17.5 30.5,17.5C 30.5,16.8333 30.1667,16.5 29.5,16.5C 29.5,15.8333 29.1667,15.5 28.5,15.5C 28.5,14.8333 28.1667,14.5 27.5,14.5C 27.5,13.8333 27.1667,13.5 26.5,13.5C 26.5,12.8333 26.1667,12.5 25.5,12.5C 25.5,11.8333 25.1667,11.5 24.5,11.5C 24.5,10.8333 24.1667,10.5 23.5,10.5C 23.5,9.83333 23.1667,9.5 22.5,9.5 Z"/></g>
<g><path style="opacity:0.571" fill="#a1ce29" d="M -0.5,10.5 C 0.166667,10.5 0.833333,10.5 1.5,10.5C 2.16667,10.5 2.5,10.8333 2.5,11.5C 2.83333,12.5 3.5,13.1667 4.5,13.5C 5.16667,13.5 5.5,13.8333 5.5,14.5C 6.16667,14.5 6.5,14.8333 6.5,15.5C 7.16667,15.5 7.5,15.8333 7.5,16.5C 7.84171,17.3382 8.50838,17.6716 9.5,17.5C 8.83333,18.1667 8.16667,18.8333 7.5,19.5C 7.16667,19.5 6.83333,19.5 6.5,19.5C 6.5,18.8333 6.16667,18.5 5.5,18.5C 5.5,17.8333 5.16667,17.5 4.5,17.5C 4.5,16.8333 4.16667,16.5 3.5,16.5C 3.5,15.8333 3.16667,15.5 2.5,15.5C 2.5,14.8333 2.16667,14.5 1.5,14.5C 1.5,13.8333 1.16667,13.5 0.5,13.5C 0.5,12.8333 0.166667,12.5 -0.5,12.5C -0.5,11.8333 -0.5,11.1667 -0.5,10.5 Z"/></g>
<g><path style="opacity:0.701" fill="#008dd5" d="M -0.5,13.5 C -0.166667,13.5 0.166667,13.5 0.5,13.5C 1.16667,13.5 1.5,13.8333 1.5,14.5C 1.5,14.8333 1.5,15.1667 1.5,15.5C 1.5,16.1667 1.5,16.8333 1.5,17.5C 0.166667,17.8333 0.166667,18.1667 1.5,18.5C 1.5,19.1667 1.83333,19.5 2.5,19.5C 2.5,20.1667 2.83333,20.5 3.5,20.5C 3.5,21.1667 3.83333,21.5 4.5,21.5C 4.5,22.1667 4.83333,22.5 5.5,22.5C 5.5,23.1667 5.83333,23.5 6.5,23.5C 6.5,24.1667 6.83333,24.5 7.5,24.5C 7.5,25.1667 7.83333,25.5 8.5,25.5C 8.5,26.1667 8.83333,26.5 9.5,26.5C 9.84171,27.3382 10.5084,27.6716 11.5,27.5C 13.1667,28.8333 14.8333,28.8333 16.5,27.5C 20.772,25.2256 24.772,22.5589 28.5,19.5C 28.5,20.1667 28.8333,20.5 29.5,20.5C 29.8039,21.1499 30.1373,21.8165 30.5,22.5C 27.08,25.9316 23.4133,28.9316 19.5,31.5C 16.8333,31.5 14.1667,31.5 11.5,31.5C 6.5,28.5 2.5,24.5 -0.5,19.5C -0.5,17.5 -0.5,15.5 -0.5,13.5 Z"/></g>
<g><path style="opacity:0.814" fill="#018cd7" d="M 23.5,14.5 C 23.5,15.1667 23.8333,15.5 24.5,15.5C 24.5,16.1667 24.8333,16.5 25.5,16.5C 25.5,17.1667 25.8333,17.5 26.5,17.5C 23.4729,21.1938 20.1396,24.5271 16.5,27.5C 14.8333,27.5 13.1667,27.5 11.5,27.5C 11.1583,26.6618 10.4916,26.3284 9.5,26.5C 8.83333,26.5 8.5,26.1667 8.5,25.5C 7.83333,25.5 7.5,25.1667 7.5,24.5C 7.5,24.1667 7.5,23.8333 7.5,23.5C 8.16667,23.5 8.83333,23.5 9.5,23.5C 11.6547,23.628 13.6547,23.128 15.5,22C 18.0362,19.295 20.7029,16.795 23.5,14.5 Z"/></g>
<g><path style="opacity:1" fill="#a1ce29" d="M 22.5,10.5 C 22.8333,10.5 23.1667,10.5 23.5,10.5C 24.1667,10.5 24.5,10.8333 24.5,11.5C 25.1667,11.5 25.5,11.8333 25.5,12.5C 26.1667,12.5 26.5,12.8333 26.5,13.5C 27.1667,13.5 27.5,13.8333 27.5,14.5C 28.1667,14.5 28.5,14.8333 28.5,15.5C 29.1667,15.5 29.5,15.8333 29.5,16.5C 30.1667,16.5 30.5,16.8333 30.5,17.5C 30.5,18.1667 30.8333,18.5 31.5,18.5C 31.5,19.1667 31.5,19.8333 31.5,20.5C 30.8333,20.5 30.1667,20.5 29.5,20.5C 28.8333,20.5 28.5,20.1667 28.5,19.5C 28.1667,18.5 27.5,17.8333 26.5,17.5C 25.8333,17.5 25.5,17.1667 25.5,16.5C 24.8333,16.5 24.5,16.1667 24.5,15.5C 23.8333,15.5 23.5,15.1667 23.5,14.5C 23.5,13.8333 23.1667,13.5 22.5,13.5C 22.5,12.5 22.5,11.5 22.5,10.5 Z"/></g>
<g><path style="opacity:1" fill="#0389e1" d="M 1.5,15.5 C 1.83333,15.5 2.16667,15.5 2.5,15.5C 3.16667,15.5 3.5,15.8333 3.5,16.5C 4.16667,16.5 4.5,16.8333 4.5,17.5C 5.16667,17.5 5.5,17.8333 5.5,18.5C 6.16667,18.5 6.5,18.8333 6.5,19.5C 6.5,20.1667 6.83333,20.5 7.5,20.5C 8.16667,20.5 8.5,20.8333 8.5,21.5C 8.83333,22.1667 9.16667,22.8333 9.5,23.5C 8.83333,23.5 8.16667,23.5 7.5,23.5C 7.16667,23.5 6.83333,23.5 6.5,23.5C 5.83333,23.5 5.5,23.1667 5.5,22.5C 4.83333,22.5 4.5,22.1667 4.5,21.5C 3.83333,21.5 3.5,21.1667 3.5,20.5C 2.83333,20.5 2.5,20.1667 2.5,19.5C 1.83333,19.5 1.5,19.1667 1.5,18.5C 1.5,18.1667 1.5,17.8333 1.5,17.5C 1.5,16.8333 1.5,16.1667 1.5,15.5 Z"/></g>
</svg>
								中国移动编码助手
							</div>
						</div>
					</div>

					<div class="flex-1 overflow-y-auto" id="qa-list" data-license="isc-gnc"></div>

					<div class="flex-1 overflow-y-auto hidden" id="conversation-list" data-license="isc-gnc"></div>

					<div id="in-progress" class="pl-4 pt-2 flex items-center hidden" data-license="isc-gnc">
						<div class="typing">思考中，请稍后</div>
						<div class="spinner">
							<div class="bounce1"></div>
							<div class="bounce2"></div>
							<div class="bounce3"></div>
						</div>

						<button id="stop-button" class="btn btn-primary flex items-end p-1 pr-2 rounded-md ml-5">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>停止
						</button>
					</div>
					<div id="in-selection" class="pl-4 pt-2 flex flex-col hidden" data-license="isc-gnc">
						<div class="flex items-center justify-between">
							<div class="typing">针对以下内容提问：</div>
							<button id="cancel-select-button" class="btn btn-primary flex items-end p-1 pr-2 rounded-md ml-5">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>取消
							</button>
						</div>
						<pre class="max-h-80 overflow-y-auto overflow-x-auto"><div id="code-block"></div></pre>
					</div>
					<div class="p-4 flex items-center pt-2" data-license="isc-gnc">
						<div class="flex-1 textarea-wrapper">
							<textarea
								type="text"
								rows="1" data-license="isc-gnc"
								id="question-input"
								placeholder="请提问："
								onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
						</div>
						<div id="question-input-buttons" class="right-6 absolute p-0.5 ml-5 flex items-center gap-2">
							<button id="clear-button" title="Submit prompt" class="ask-button rounded-lg p-0.5">
     						    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-license="isc-gnc" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
							</button>
							<button id="ask-button" title="Submit prompt" class="ask-button rounded-lg p-0.5">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
							</button>
						</div>
					</div>
				</div>

				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private getRandomId() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}
}
