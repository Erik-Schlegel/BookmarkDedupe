
import { readFile, writeFile, access } from 'fs/promises';
import * as cheerio from 'cheerio';


const dedupeBookmarkString = (htmlStr, pruneNodes=true) =>
{
	const $ = cheerio.load(htmlStr);

	$('body > DL DL').each(
		(_i, el)=>
		{
			let bookmarkSet = {};
			$(el).find('dt a').each(
				(_index, el)=>
				{
					let href = $(el).attr('href');
					if(bookmarkSet[href])
						$(el).parent().remove();
					else
						bookmarkSet[href] = 1;
				}
			)

		}
	);

	/*
	DuckDuckGo's exported Bookmark html is atrocious. pruneNodes breaks correct html syntax,
	but in order to follow the DuckDuckGo Browser's "conventions" we need to revert fixes
	which are introduced implicitly by cheerio.
	*/
	return (pruneNodes ?
		$.html().replace(/<\/?(html|head|body)>/g, '') :
		$.html()
	)
}


const dedupeBookmarkFile = async (inFilePath, outFilePath)=>
{
	try
	{
		await access(inFilePath);
		let bookmarkContent = await readFile(inFilePath, 'utf-8');
		bookmarkContent = dedupeBookmarkString(bookmarkContent, true);
		writeFile(outFilePath, bookmarkContent);
	}
	catch(ex)
	{
		console.error(ex);
	}
}


dedupeBookmarkFile('./orig/bookmarks_ddg_20240907.html', './out.html');
