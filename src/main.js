import {Store, TagKit} from './store.js';
import {Users} from './users.js';
import {InkCat, Smudge} from './components.js';

const e=React.createElement;

const Tag=({children})=> e('span',{className:'chip'},['#',children]);

const Header=({nick,onSearch,onNav,view,isDark,toggleDark})=> e('header',
  {className:'sticky top-0 z-40 bg-[var(--paper)]/85 backdrop-blur border-b border-[color:var(--line)]'},
  e('div',{className:'relative mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-3'},
    e('div',{className:'relative w-10 h-8'},
      e(Smudge,{className:'absolute -top-6 -left-2 w-20'}),
      e(InkCat,{className:'absolute -top-5 -left-6 w-16',alpha:.6})
    ),
    e('h1',{className:'text-lg font-extrabold tracking-wide'},'OVRA'),
    e('input',{onChange:e=>onSearch(e.target.value),placeholder:'검색…',className:'ms-2 flex-1 w-28 sm:w-44 md:w-64 lg:w-80 xl:w-96 rounded-xl px-3 py-2 bg-transparent border border-[color:var(--line)] placeholder-[color:var(--muted)] outline-none'}),
    e('nav',{className:'flex items-center gap-3 text-sm text-[color:var(--muted)] ms-2'},
      ['feed','bookmarks','tags'].map(m=> e('button',{key:m,onClick:()=>onNav(m),
        className:'hover:underline ' + (view===m?'font-semibold text-[color:var(--text)]':'')}, m==='feed'?'피드':m==='bookmarks'?'북마크':'태그'))
    ),
    e('div',{className:'ms-auto flex items-center gap-2'},
      e('button',{className:'btn-sub',onClick:toggleDark}, isDark?'☀️':'🌙'),
      e('span',{className:'text-xs text-[color:var(--muted)]'},nick)
    )
  )
);

const Composer=({nick,onPost})=>{
  const [title,setTitle]=React.useState('');
  const [body,setBody]=React.useState('');
  const [tags,setTags]=React.useState([]);
  const [draft,setDraft]=React.useState('');
  React.useEffect(()=>{ const s=TagKit.suggest(title,body); setTags(prev=>[...new Set([...prev,...s])].slice(0,5)); },[title,body]);
  return e('div',{className:'card p-4'},
    e('div',{className:'flex gap-3'},
      e('div',{className:'h-10 w-10 shrink-0 rounded-full border flex items-center justify-center'},nick[0]),
      e('div',{className:'flex-1'},
        e('input',{value:title,onChange:e=>setTitle(e.target.value.slice(0,60)),placeholder:'제목',className:'w-full mb-2 rounded px-3 py-2 bg-transparent border border-[color:var(--line)]'}),
        e('textarea',{value:body,onChange:e=>setBody(e.target.value.slice(0,300)),placeholder:'한두 줄로 적어보세요…',className:'w-full min-h-24 resize-y rounded bg-transparent p-3 border border-[color:var(--line)]'}),
        e('div',{className:'mt-2 flex items-center gap-2 flex-wrap'},
          tags.map(t=> e('span',{key:t,className:'chip'},['#'+t,' ', e('button',{className:'text-[10px]',onClick:()=>setTags(tags.filter(x=>x!==t))},'×')])),
          e('input',{value:draft,onChange:e=>setDraft(e.target.value),placeholder:'#태그추가',className:'rounded px-2 py-1 bg-transparent border border-[color:var(--line)]'}),
          e('button',{className:'text-xs text-[color:var(--muted)]',onClick:()=>{if(draft && !tags.includes(draft)) setTags([...tags,draft]); setDraft('')}},'추가'),
          e('button',{className:'btn ml-auto',onClick:()=>{
            if(!title && !body) return;
            onPost({id:Store.uid(),title,body,tags,author:nick,ts:Date.now(),likes:0,likedBy:[],bookmarkedBy:[],image:null,comments:[],reports:0});
            setTitle(''); setBody(''); setTags([]);
          }},'게시')
        )
      )
    )
  );
};

const PostCard=({post,me,onLike,onBookmark})=>{
  const liked=post.likedBy.includes(me), bm=post.bookmarkedBy.includes(me);
  return e('article',{className:'card overflow-hidden'},
    e('div',{className:'relative p-4'},
      e(Smudge,{className:'absolute -top-10 -right-6 w-40 pointer-events-none'}),
      e('div',{className:'flex items-center gap-2 text-xs text-[color:var(--muted)]'},
        e('div',{className:'h-8 w-8 rounded-full border flex items-center justify-center'},post.author[0]),
        e('span',null,post.author),
        e('span',null,' · ',new Date(post.ts).toLocaleString())
      ),
      e('h3',{className:'mt-2 font-semibold'},post.title||'(제목 없음)'),
      e('p',{className:'mt-1 leading-relaxed'},post.body),
      e('div',{className:'mt-3 flex flex-wrap gap-2'}, post.tags.map(t=> e(Tag,{key:t},t)))
    ),
    e('div',{className:'flex items-center justify-between border-t border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)]'},
      e('div',{className:'flex gap-4 items-center'},
        e('button',{onClick:()=>onLike(post.id), className: liked?'font-semibold text-black dark:text-white':''}, (liked?'♥':'♡')+' '+post.likes),
        e('button',null,'댓글 ',post.comments.length),
        e('button',{onClick:()=>onBookmark(post.id), className: bm?'font-semibold text-black dark:text-white':''}, bm?'🔖해제':'🔖북마크')
      ),
      e('div',{className:'flex gap-3 items-center'},
        e('button',null,'신고', post.reports?`(${post.reports})`:''),
      )
    )
  );
};

function App(){
  const [nick,setNick]=React.useState(Users.current()||Users.random());
  const [posts,setPosts]=React.useState(Store.load(Store.DB,[]));
  const [view,setView]=React.useState('feed');
  const [search,setSearch]=React.useState('');
  const [isDark,setDark]=React.useState(document.documentElement.classList.contains('dark'));

  React.useEffect(()=>Users.set(nick),[nick]);
  React.useEffect(()=>Store.save(Store.DB,posts),[posts]);
  React.useEffect(()=>{ if(posts.length===0){ setPosts([{id:Store.uid(),title:'환영합니다',body:'잉크고양이 동네에 오신 걸 환영해요.',tags:['공지','시작'],author:'시스템',ts:Date.now()-200000,likes:1,likedBy:[],bookmarkedBy:[],image:null,comments:[],reports:0}]) } },[]);

  const toggleDark=()=>{document.documentElement.classList.toggle('dark'); setDark(d=>!d)};
  const onNav=(mode)=>setView(mode);
  const onPost=(p)=>setPosts([p,...posts]);
  const onLike=id=>setPosts(ps=>ps.map(p=> p.id===id?{...p,likedBy:p.likedBy.includes(nick)?p.likedBy.filter(u=>u!==nick):[...p.likedBy,nick],likes:p.likedBy.includes(nick)?Math.max(0,p.likes-1):p.likes+1}:p));
  const onBookmark=id=>setPosts(ps=>ps.map(p=> p.id===id?{...p,bookmarkedBy:p.bookmarkedBy.includes(nick)?p.bookmarkedBy.filter(u=>u!==nick):[...p.bookmarkedBy,nick]}:p));

  let list=posts.slice();
  if(view==='bookmarks') list=list.filter(p=>p.bookmarkedBy.includes(nick));
  if(search.trim()){ const k=search.toLowerCase(); list=list.filter(p=>[p.title,p.body,p.author,...p.tags].join(' ').toLowerCase().includes(k)) }

  const tagIndex=TagKit.index(posts);

  return e('div',null,
    e(Header,{nick,onSearch:setSearch,onNav:setView,view,isDark,toggleDark}),
    e('main',{className:'mx-auto max-w-[1200px] px-4 py-6 grid md:grid-cols-12 gap-6'},
      e('aside',{className:'hidden md:block md:col-span-4 xl:col-span-3'},
        e('div',{className:'sticky top-20 space-y-4'},
          e('div',{className:'card p-4'},
            e('div',{className:'text-sm text-[color:var(--muted)]'},'안녕, ',nick),
            e('div',{className:'mt-2 flex gap-2'},
              e('button',{className:'btn-sub',onClick:()=>setNick(Users.random())},'닉네임 변경'),
              e('button',{className:'btn-sub',onClick:()=>{const n=prompt('새 닉네임'); try{ if(n) setNick(Users.login(n)) }catch(err){ alert(err.message) } }},'직접 설정')
            )
          ),
          e(Composer,{nick,onPost})
        )
      ),
      e('section',{className:'md:col-span-8 xl:col-span-6 space-y-6'},
        e('div',{className:'md:hidden'}, e(Composer,{nick,onPost})),
        e('div',{className:'card p-3'},
          e('div',{className:'font-semibold'},'트렌딩 태그'),
          e('div',{className:'mt-2 -m-1'}, tagIndex.slice(0,18).map(([t,c])=> e('span',{key:t,className:'chip me-2 mb-2'},`#${t} ×${c}`)))
        ),
        list.length===0? e('div',{className:'text-center text-[color:var(--muted)]'},'결과가 없어요.'):null,
        e('div',{className:'space-y-5'}, list.map(p=> e(PostCard,{key:p.id,post:p,me:nick,onLike,onBookmark})))
      ),
      e('aside',{className:'hidden xl:block xl:col-span-3 space-y-4'},
        e('div',{className:'card p-4 relative overflow-hidden'},
          e(Smudge,{className:'absolute -top-10 -left-6 w-40'}),
          e('div',{className:'font-semibold'},'팔로우한 태그'),
          e('div',{className:'text-sm text-[color:var(--muted)] mt-2'},'향후 추가 예정')
        )
      )
    ),
    e('footer',{className:'mx-auto max-w-[1200px] px-4 py-10 text-center text-xs text-[color:var(--muted)]'}, `© ${new Date().getFullYear()} OVRA · ink & paper`)
  );
}

if('serviceWorker' in navigator){ window.addEventListener('load',()=> navigator.serviceWorker.register('/sw.js')); }

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
