import React, { useState } from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, getKeyValue, Chip, Button} from "@nextui-org/react";
import {Input, Link} from "@nextui-org/react";
import data from "../data.json";
import { fromDate, getLocalTimeZone } from "@internationalized/date";

/* data example
{
	"name": "polyhal",
	"description": "This is a crate that help you porting your kernel to multiple platforms.",
	"authors": [
		{
		"name": "yfblock",
		"email": "321353225@qq.com"
		}
	],
	"keywords": [
		"hal",
		"arch",
		"platform"
	],
	"url": "https://github.com/Byte-OS/polyhal",
	"repo": "Byte-OS/polyhal",
	"created_at": "2024-03-25T14:14:06Z",
	"updated_at": "2024-05-07T18:26:32Z"
}
*/

function CheckNotAvailable({children, item}: any) {
	return <>
		{item?children:<p style={{
			color: 'red'
		}}>Not Available</p>}
	</>
}

export default function IndexPage() {
	let [condition, setCondition] = useState("");
  return <>
	<div style={{
		width: '90%',
		margin: 'auto',
	}}>
		<div style={{
			padding: '1em 1em'
		}}>
			<Input 
				fullWidth={true}
				labelPlacement="outside" 
				placeholder="请输入关键词" 
				type="text" 
				size="sm"
				value={condition} 
				onInput={(e) => setCondition(e.currentTarget.value)} 
			/>
		</div>
		<Table aria-label="Example static collection table" width={"100%"}>
			<TableHeader>
				<TableColumn>name</TableColumn>
				<TableColumn maxWidth={"40%"}>description</TableColumn>
				<TableColumn>docs</TableColumn>
				<TableColumn>authors</TableColumn>
				<TableColumn>keywords</TableColumn>
				<TableColumn>repo</TableColumn>
				<TableColumn>update_at</TableColumn>
				<TableColumn>extra_operation</TableColumn>
			</TableHeader>
			<TableBody items={data.filter((item) => {
				return item.name.match(condition) || item.description?.match(condition) || (item.keywords != undefined && item.keywords.indexOf(condition) >= 0)
			})}>
				{(item) => (
				<TableRow key={item?.name}>
					{/* {(columnKey) => {
						console.log(item)
						console.log(getKeyValue(item, columnKey));
						return <TableCell>{getKeyValue(item, columnKey)}</TableCell>
					}} */}
					<TableCell><Link color="primary" href={"https://github.com/" + item['repo']}>{item['name']}</Link></TableCell>
					<TableCell><CheckNotAvailable item={item['description']}>
					{item['description']}
					</CheckNotAvailable></TableCell>
					<TableCell>
						{
							item['doc_url']!= undefined?
							<Link color="primary" href={item['doc_url']}>Document</Link>:
							<a>not available</a>
						}
					</TableCell>
					<TableCell><CheckNotAvailable item={item['authors']}>
					{
					item['authors']?.map((author) => {
						return  <> {typeof(author) === "string" ?author:(author['name'] + author['email'])} <br /></>
					})
					}
					</CheckNotAvailable></TableCell>
					<TableCell><CheckNotAvailable item={item['keywords']}>
					{item['keywords']?.map((value) => {
						return <><Chip style={{
							cursor: "pointer"
						}} onClick={() => setCondition(value)}>{value}</Chip>&nbsp;</>;
					})}
					</CheckNotAvailable></TableCell>
					<TableCell>{item['repo']}</TableCell>
					<TableCell>{(new Date(item['updated_at'])).toLocaleString()}</TableCell>
					<TableCell>
						<Button onPress={()=>window.open(`https://github.com/${item['repo']}/issues/new/choose`)} size="sm" color="primary">Comment</Button>
					</TableCell>
				</TableRow>
				)}
			</TableBody>
		</Table>
	</div>
  </>;
}
