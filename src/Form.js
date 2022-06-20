import {useState, useEffect, useRef, useCallback} from 'react'
import ReactPaginate from 'react-paginate'
import  {v4} from 'uuid'

const Note =({onHandleSubmit=f=>f, onHandleEdit =f=>f,changePost=f=>f,handleClear = f=>f, editedItem})=> {
    const noteRef = useRef()
    let _note
    if(editedItem.length!==0){
        noteRef.current.value =  editedItem[0].post
    }
    const submit = (e)=>{
    e.preventDefault()
    _note = noteRef.current.value
    if(editedItem.length===0){
        onHandleSubmit(_note)
    }
    else if(editedItem.length!==0){
        changePost(_note)
        onHandleEdit()
    }
    handleClear() 
    noteRef.current.value=''
    }
    return(
        <form className = "sometext" onSubmit = {submit}>
            <textarea className="placeholder" ref = {noteRef} placeholder = "Enter text"></textarea>
            <button className = "save" onClick = {submit}>Save</button> 
        </form>
    )
}

const Post =({post, search, onRemove = f=>f, onEdit=f=>f})=> {
    if(!search) {
        return(
        <div className = "post">
            {post}
            <button className = "buttonRemove" onClick = {onRemove}>Remove</button>
            <button className = "buttonEdit" onClick = {onEdit}>Edit</button>
        </div>
        )
    } 
    const regex = new RegExp(`(${search})`,'gi')
    const parts = post.split(regex)

    if(regex.test(post)){
        console.log(parts)
        return(
        <div className = "post">
        <span>
            {parts.map((part,i)=>{
            return regex.test(part)?(
            <mark style={{marginLeft:"-2px"}} key = {i}>{part}</mark>)
            :(
                <span key = {i}>{part} </span>
            );
            })}
            <button className = "buttonRemove" onClick = {onRemove}>Remove</button>
            <button className="buttonEdit" onClick = {onEdit}>Edit</button>
        </span>
        </div>
        )} else {return null}
    }

const PostList =({items,search,onRemove = f=>f, onEdit=f=>f})=>{
    if(items){
    return (
        <div>
            {items.map(item=> 
                <Post key = {item.id} {...item}
                onRemove = {()=>onRemove(item.id)}
                onEdit = {() =>onEdit(item.id)}
                search={search}/>
            )}
        </div>
    )}
   }


const Tag = ({tag, onEdit = f=>f})=> {
    if(tag){
    return(
         <div className = "tag"onClick={onEdit}>
             {tag}
        </div>)}
}

const TagList =({items, onEdit = f=>f, handleChange = f=>f})=>{
    if(items){
    return (
        <div className='tagInput'>
           <input type= "search" placeholder = "Search by tag" onChange={handleChange}></input>
           <div className = "taglist">Tag List</div>
           {items.map(item=> 
              <Tag onEdit ={()=>onEdit(item.id)} key = {item.id} {...item}/>
           )}
        </div>
    )}
}
const ItemList = ({currentItems,search, onRemove=f=>f, onEdit = f=>f, handleChange=f=>f}) =>{
    if(currentItems||currentItems===null){
 return(
     <div>
         <PostList items= {currentItems} onRemove = {onRemove} onEdit = {onEdit} search={search}/>
         <TagList items = {currentItems} onEdit = {onEdit} handleChange = {handleChange}/>
     </div>
 )}
}

const PaginatedItems= ({items,itemsPerPage,search, onRemove=f=>f, onEdit=f=>f, handleChange=f=>f})=>{
    const [currentItems, setCurrentItems] = useState(null)
    const [pageCount, setPageCount] = useState(0)
    const [itemOffset, setItemOffset] = useState(0)
    const [paginate,setPaginate] = useState()
    
    useEffect(()=>{
        let endOffset = itemOffset + itemsPerPage
        if(items) {
        if(endOffset>items.length){
            endOffset=items.length
        }
        let newPaginate = `${itemOffset+1} - ${endOffset} from ${items.length}`
        if((itemOffset+1)===items.length){
            newPaginate = `${itemOffset+1} from ${items.length}`
        }
        if(items.length===0||itemOffset.length===0){
            newPaginate = ''
        }
        setCurrentItems(items.slice(itemOffset,endOffset))
        setPageCount(Math.ceil(items.length/itemsPerPage))
        setPaginate(newPaginate)}
       },[itemOffset, itemsPerPage, items])
  
       
const handlePageClick =(event) =>{
    const newOffset = event.selected*itemsPerPage%items.length
    console.log(`User requested page number ${event.selected} which is offset ${newOffset}`)
    setItemOffset(newOffset)
    }
    if(items.length<=5){
        return (
            <div>
                <div className = "wrapper">
            <span className = "paginate">{paginate}</span>
            <ReactPaginate 
            nextLabel=" >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            marginPagesDisplayed={2}
            pageCount={pageCount}
            previousLabel="< "
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            breakLabel="..."
            breakClassName="page-item"
            breakLinkClassName="page-link"
            containerClassName="pagination"
            activeClassName="active"
            renderOnZeroPageCount={null}/>
    </div>
    <ItemList currentItems = {currentItems} search={search} onRemove = {onRemove} onEdit ={onEdit} handleChange = {handleChange} />
    </div>
        )
    } else {
        return(
    <div>
        <div className = "wrapper">
        <span className = "paginate">{paginate}</span>
        <ReactPaginate 
        nextLabel=" >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        marginPagesDisplayed={2}
        pageCount={pageCount}
        previousLabel="< "
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousClassName="page-item"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}/>
    </div>
    <ItemList currentItems = {currentItems} search = {search} onRemove = {onRemove} onEdit ={onEdit} />
</div>
    )}
}

const WordCounter = ({items})=> {
    const [wordCounts, setWordCounts] = useState({})
    const [all, setAll]=useState('')
    const [wordsCounToArray, setWordsCounToArray] = useState([])
    const [sortByNumber, setSortByNumber] = useState(false)

    const addWordCounts=useCallback((word)=> {
        wordCounts[word]= (wordCounts[word])?wordCounts[word]+1:1
    },[wordCounts])
   
    const countWordsInText=useCallback((text)=>{
       const words = text
       .toString()
       .toLowerCase()
       .split(/[\s!"№;%:?*()@#$^&*_+<>/]/)
       .sort();
       words.filter(word=>word)
       .forEach(word=>addWordCounts(word)) 
       return wordCounts
    },[addWordCounts,wordCounts])

    useEffect(()=>{
    
        const all1 = items.map(item=>item.post).join(' ')
        setAll(all1)
        setWordCounts({})
    }, [items,countWordsInText])

    useEffect(()=>{
        const count1 = countWordsInText(all)
        console.log(count1)
        setWordCounts(count1) 
    }, [countWordsInText,all])

    useEffect(()=>{
        const count2 = (sortByNumber===false)?(Object.entries(wordCounts).sort()):(Object.entries(wordCounts).sort((a,b)=>b[1]-a[1]))
        setWordsCounToArray(count2)
    }, [all, countWordsInText, wordCounts,sortByNumber])
  
    const byNumber=()=> {
       setSortByNumber(!sortByNumber)
    }
       
     if(items.length!==0){
        return(
            <div className ="wordcounter">
                <span>Word Counter</span>     <input type = "checkbox" onChange = {byNumber}></input>Sorting by frequency
                {wordsCounToArray.map((item,i)=>
                    <div key = {i}> {item[0]} : {item[1]}</div>)
                }
            </div>)}
        else {return null}
        }
         
export const Form = ()=> {
    const [items, setItems] = useState([])
    const [editedItem,setEditedItem] =useState([])
    const [search, setSearch] = useState('')
    const [sortPaging, setSortPaging] = useState(false)  

    function handleSubmit(post){
        const pattern = /(#[a-zа-я\d-]+)/gi
        const tag = post.match(pattern)
        console.log(tag)
        if(pattern.test(post)){
            const items1 = [...items,
            {post,
            tag:tag[0], 
            id:v4()}]
            setItems(items1)
         }else{
            const items1 = [...items,
            {post,
            tag:null,
            id:v4()}]
            setItems(items1)
          }
      }

    function handleRemove(id) {
        const items1 = items.filter(item=>item.id!==id)
        setItems(items1)
    }

    function handleEdit(id) {
        const editedItem_1 = items.filter(item=>
        item.id===id)
        setEditedItem(editedItem_1)
        console.log(editedItem_1)
    }

    function handleEdit1() {
        const items1 = items.map(item=>{
            if(item.id===editedItem[0].id){
            return editedItem[0] 
            } else {
            return item}
        })
        console.log(items1)
        setItems(items1)
    }

    function changePost(post) {
        function obj3(objec,post){
            if(objec.length!==0){
                console.log(objec)
                objec.splice(0,1,{
                post:post,
                id:objec[0].id,
                tag:post.match(/(#[a-zа-я\d-]+)/g)
            });
                return objec
            }
        }

    const editedItem1 = obj3(editedItem, post)
    setEditedItem(editedItem1)
    console.log(editedItem1)
    }
   
    function handleClear(){
        const editedItem = []
        setEditedItem(editedItem)
    }
        
    function handleChange(e) {
    let search_1 = e.target.value
    setSearch(search_1)
    console.log(search_1)
    }

   function sortingPage() {
        setSortPaging(!sortPaging)
   }

     if(sortPaging) {
        return(
            <div className = "container">
            <Note onHandleSubmit = {handleSubmit} onHandleEdit = {handleEdit1} changePost = {changePost} handleClear = {handleClear} editedItem = {editedItem}/>
           <span className = "sort"> Sorting by page<input type ="checkbox" onChange = {sortingPage}></input></span>
            <PaginatedItems items = {items} itemsPerPage = {2} search = {search} onRemove = {handleRemove} onEdit = {handleEdit} handleChange = {handleChange} />
            <WordCounter items ={items} />
           </div>
    )}else{
       return(
            <div className = "container">
            <Note onHandleSubmit = {handleSubmit} onHandleEdit = {handleEdit1} changePost = {changePost} handleClear = {handleClear} editedItem = {editedItem}/>
            <span className = "sort"> Sorting by page<input type ="checkbox" onChange = {sortingPage}></input></span>
            <ItemList currentItems = {items} search={search} onRemove = {handleRemove} onEdit ={handleEdit} handleChange = {handleChange}/>
            <WordCounter items ={items}/>
            </div>
        ) 
    }
}