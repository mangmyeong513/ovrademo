import { Store } from './store.js';
const NICK_RULE = /^[\p{L}\p{N}_\-#]{2,20}$/u;

export const Users = {
  current:()=>Store.load(Store.NICK,null),
  set:(nick)=>{ const n=(nick||'').trim(); if(!NICK_RULE.test(n)) throw new Error('닉네임은 2~20자, 한글/영문/숫자/_, -, #만 가능해요.'); Store.save(Store.NICK,n); return n; },
  random:()=>{ const A=['서늘','묵향','잔향','안개','새벽','그믐','흑연','먹빛']; const B=['고양이','수달','너구리','비둘기','제비','담비']; return `${A[Math.floor(Math.random()*A.length)]}${B[Math.floor(Math.random()*B.length)]}#${Math.floor(100+Math.random()*900)}`; },
  login:(n)=>Users.set(n),
  logout:()=>localStorage.removeItem(Store.NICK),
  loggedIn:()=>!!Users.current(),
  displayName:()=>Users.current()||'게스트'
};