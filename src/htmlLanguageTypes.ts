/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	Position, Range, Location,
	MarkupContent, MarkupKind, MarkedString, DocumentUri,
	SelectionRange, WorkspaceEdit,
	CompletionList, CompletionItemKind, CompletionItem, CompletionItemTag, InsertTextMode, Command,
	SymbolInformation, SymbolKind,
	Hover, TextEdit, InsertReplaceEdit, InsertTextFormat, DocumentHighlight, DocumentHighlightKind,
	DocumentLink, FoldingRange, FoldingRangeKind,
	SignatureHelp, Definition, Diagnostic, FormattingOptions, Color, ColorInformation, ColorPresentation
} from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';


export {
	TextDocument,
	Position, Range, Location,
	MarkupContent, MarkupKind, MarkedString, DocumentUri,
	SelectionRange, WorkspaceEdit,
	CompletionList, CompletionItemKind, CompletionItem, CompletionItemTag, InsertTextMode, Command,
	SymbolInformation, SymbolKind,
	Hover, TextEdit, InsertReplaceEdit, InsertTextFormat, DocumentHighlight, DocumentHighlightKind,
	DocumentLink, FoldingRange, FoldingRangeKind,
	SignatureHelp, Definition, Diagnostic, FormattingOptions, Color, ColorInformation, ColorPresentation
};

export interface HTMLFormatConfiguration {
	tabSize?: number;
	insertSpaces?: boolean;
	indentEmptyLines?: boolean;
	wrapLineLength?: number;
	unformatted?: string;
	contentUnformatted?: string;
	indentInnerHtml?: boolean;
	wrapAttributes?: 'auto' | 'force' | 'force-aligned' | 'force-expand-multiline' | 'aligned-multiple' | 'preserve' | 'preserve-aligned';
	wrapAttributesIndentSize?: number;
	preserveNewLines?: boolean;
	maxPreserveNewLines?: number;
	indentHandlebars?: boolean;
	endWithNewline?: boolean;
	extraLiners?: string;
	indentScripts?: 'keep' | 'separate' | 'normal';
	templating?: boolean;
	unformattedContentDelimiter?: string;

}

export interface HoverSettings {
	documentation?: boolean;
	references?: boolean
}

export interface CompletionConfiguration {
	[provider: string]: boolean | undefined | string;
	hideAutoCompleteProposals?: boolean;
	attributeDefaultValue?: 'empty' | 'singlequotes' | 'doublequotes';
}

export interface Node {
	tag: string | undefined;
	start: number;
	startTagEnd: number | undefined;
	end: number;
	endTagStart: number | undefined;
	children: Node[];
	parent?: Node;
	attributes?: { [name: string]: string | null } | undefined;
}

export enum TokenType {
	StartCommentTag, // 刚刚遍历了 <!--
	Comment, // 刚刚遍历了 注释
	EndCommentTag, // 刚刚遍历了 --!>
	StartTagOpen, // 刚刚遍历了 < （下一个是tag）
	StartTagClose, // 刚刚遍历了 > （下一个是内容）
	StartTagSelfClose, // 刚刚遍历了 />（自闭合）
	StartTag, // 刚刚遍历了 start tag
	EndTagOpen, // 刚刚遍历了 </ （下一个是 tag ）
	EndTagClose, // 刚刚遍历了 > ，结束标签
	EndTag, // 刚刚遍历了 end tag
	DelimiterAssign, // 刚刚 遍历了 = 号（属性name之后）
	AttributeName, // 刚刚 遍历了 属性name
	AttributeValue, // 刚刚 遍历了 属性 value
	StartDoctypeTag, // 刚刚遍历了 !doctype
	Doctype, // 刚刚遍历了 doctype里面的内容
	EndDoctypeTag, // 刚刚遍历了 doctype 之后的 >
	Content,  // 刚刚遍历了 html tag里面的内容
	Whitespace, // 刚刚遍历了空白字符
	Unknown,
	Script, // 刚刚遍历了 script content
	Styles, // 刚刚遍历了 style content
	EOS // 结束
}

export enum ScannerState {
	WithinContent, // else
	AfterOpeningStartTag, // < 之后 && 后面有可能跟着 tag
	AfterOpeningEndTag, // </ 之后 && 后面有可能跟着 tag
	WithinDoctype, // !doctype 之后
	WithinTag, // 处于 tag 之中
	WithinEndTag, // 处于 end tag 之中
	WithinComment, // <!-- 之后
	WithinScriptContent, // <script> 之后
	WithinStyleContent, // <style> 之后
	AfterAttributeName, // <xxx [name] 之后
	BeforeAttributeValue // <xxx [name]= 之后
}

export interface Scanner {
	scan(): TokenType;
	getTokenType(): TokenType;
	getTokenOffset(): number;
	getTokenLength(): number;
	getTokenEnd(): number;
	getTokenText(): string;
	getTokenError(): string | undefined;
	getScannerState(): ScannerState;
}

export declare type HTMLDocument = {
	roots: Node[];
	findNodeBefore(offset: number): Node;
	findNodeAt(offset: number): Node;
};

export interface DocumentContext {
	resolveReference(ref: string, base: string): string | undefined;
}

export interface HtmlAttributeValueContext {
	document: TextDocument;
	position: Position;
	tag: string;
	attribute: string;
	value: string;
	range: Range;
}

export interface HtmlContentContext {
	document: TextDocument;
	position: Position;
}

export interface ICompletionParticipant {
	onHtmlAttributeValue?: (context: HtmlAttributeValueContext) => void;
	onHtmlContent?: (context: HtmlContentContext) => void;
}

export interface IReference {
	name: string;
	url: string;
}

export interface ITagData {
	name: string;
	description?: string | MarkupContent;
	attributes: IAttributeData[];
	references?: IReference[];
}

export interface IAttributeData {
	name: string;
	description?: string | MarkupContent;
	valueSet?: string;
	values?: IValueData[];
	references?: IReference[];
}

export interface IValueData {
	name: string;
	description?: string | MarkupContent;
	references?: IReference[];
}

export interface IValueSet {
	name: string;
	values: IValueData[];
}

export interface HTMLDataV1 {
	version: 1 | 1.1;
	tags?: ITagData[];
	globalAttributes?: IAttributeData[];
	valueSets?: IValueSet[];
}

export interface IHTMLDataProvider {
	getId(): string;
	isApplicable(languageId: string): boolean;

	provideTags(): ITagData[];
	provideAttributes(tag: string): IAttributeData[];
	provideValues(tag: string, attribute: string): IValueData[];
}

/**
 * Describes what LSP capabilities the client supports
 */
export interface ClientCapabilities {
	/**
	 * The text document client capabilities
	 */
	textDocument?: {
		/**
		 * Capabilities specific to completions.
		 */
		completion?: {
			/**
			 * The client supports the following `CompletionItem` specific
			 * capabilities.
			 */
			completionItem?: {
				/**
				 * Client supports the follow content formats for the documentation
				 * property. The order describes the preferred format of the client.
				 */
				documentationFormat?: MarkupKind[];
			};

		};
		/**
		 * Capabilities specific to hovers.
		 */
		hover?: {
			/**
			 * Client supports the follow content formats for the content
			 * property. The order describes the preferred format of the client.
			 */
			contentFormat?: MarkupKind[];
		};
	};
}

export namespace ClientCapabilities {
	export const LATEST: ClientCapabilities = {
		textDocument: {
			completion: {
				completionItem: {
					documentationFormat: [MarkupKind.Markdown, MarkupKind.PlainText]
				}
			},
			hover: {
				contentFormat: [MarkupKind.Markdown, MarkupKind.PlainText]
			}
		}
	};
}

export interface LanguageServiceOptions {
	/**
	 * Unless set to false, the default HTML data provider will be used 
	 * along with the providers from customDataProviders.
	 * Defaults to true.
	 */
	useDefaultDataProvider?: boolean;

	/**
	 * Provide data that could enhance the service's understanding of
	 * HTML tag / attribute / attribute-value
	 */
	customDataProviders?: IHTMLDataProvider[];

	/**
	 * Abstract file system access away from the service.
	 * Used for path completion, etc.
	 */
	fileSystemProvider?: FileSystemProvider;

	/**
	 * Describes the LSP capabilities the client supports.
	 */
	clientCapabilities?: ClientCapabilities;
}

export enum FileType {
	/**
	 * The file type is unknown.
	 */
	Unknown = 0,
	/**
	 * A regular file.
	 */
	File = 1,
	/**
	 * A directory.
	 */
	Directory = 2,
	/**
	 * A symbolic link to a file.
	 */
	SymbolicLink = 64
}

export interface FileStat {
	/**
	 * The type of the file, e.g. is a regular file, a directory, or symbolic link
	 * to a file.
	 */
	type: FileType;
	/**
	 * The creation timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
	 */
	ctime: number;
	/**
	 * The modification timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
	 */
	mtime: number;
	/**
	 * The size in bytes.
	 */
	size: number;
}

export interface FileSystemProvider {
	stat(uri: DocumentUri): Promise<FileStat>;
	readDirectory?(uri: DocumentUri): Promise<[string, FileType][]>;
}
