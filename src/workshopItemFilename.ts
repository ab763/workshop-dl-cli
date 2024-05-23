export function filename(title: string): string
{
	return title
		.split(/[\*\/\\\|\?\"\'\:\;]/).join(" ")
		.split(/[{[<]/).join("(")
		.split(/[}\]>]/).join(")");
}
