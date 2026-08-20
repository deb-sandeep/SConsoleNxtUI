import {
  TagQueryConditionNode, TagQueryGroupNode, TagQueryNode, TagQueryNodeWire
} from "@jee-common/util/tag-query-types";

// Local mirror of the id shape used everywhere else in this feature — plain
// random strings, only ever compared for equality, never parsed.
export function uid():string {
  return 'n' + Math.random().toString( 36 ).slice( 2, 9 ) ;
}

export function createDefaultTagQuery():TagQueryGroupNode {
  return { id:'root', type:'group', op:'AND', negated:false, collapsed:false, children:[] } ;
}

export function findNode( node:TagQueryNode, id:string ):TagQueryNode | null {
  if( node.id === id ) return node ;
  if( node.type === 'group' ) {
    for( const c of node.children ) {
      const found = findNode( c, id ) ;
      if( found ) return found ;
    }
  }
  return null ;
}

// Rebuilds `tree` with `updater` applied to the node matching `id`, leaving
// every other node untouched (structural sharing, not a deep clone).
export function updateNode( tree:TagQueryGroupNode, id:string,
                             updater:( n:TagQueryNode ) => TagQueryNode ):TagQueryGroupNode {
  return updateNodeRec( tree, id, updater ) as TagQueryGroupNode ;
}

function updateNodeRec( node:TagQueryNode, id:string,
                         updater:( n:TagQueryNode ) => TagQueryNode ):TagQueryNode {
  if( node.id === id ) return updater( node ) ;
  if( node.type !== 'group' ) return node ;
  return { ...node, children: node.children.map( c => updateNodeRec( c, id, updater ) ) } ;
}

// Removes the node with `id` from wherever it lives in the tree. No-op if
// `id` is the root (the root itself can never be removed — see
// TagBrowserService.removeNode's guard).
export function removeNode( tree:TagQueryGroupNode, id:string ):TagQueryGroupNode {
  return removeNodeRec( tree, id ) as TagQueryGroupNode ;
}

function removeNodeRec( node:TagQueryNode, id:string ):TagQueryNode {
  if( node.type !== 'group' ) return node ;
  const children = node.children
    .filter( c => c.id !== id )
    .map( c => removeNodeRec( c, id ) ) ;
  return { ...node, children } ;
}

// Replaces the group with `id` with its own children, spliced in place into
// the parent — "dissolve group" flattens one level of nesting without
// losing its conditions.
export function dissolveGroup( tree:TagQueryGroupNode, id:string ):TagQueryGroupNode {
  return dissolveRec( tree, id ) as TagQueryGroupNode ;
}

function dissolveRec( node:TagQueryNode, id:string ):TagQueryNode {
  if( node.type !== 'group' ) return node ;
  const children:TagQueryNode[] = [] ;
  node.children.forEach( c => {
    if( c.id === id && c.type === 'group' ) children.push( ...c.children ) ;
    else children.push( dissolveRec( c, id ) ) ;
  } ) ;
  return { ...node, children } ;
}

export function addChild( tree:TagQueryGroupNode, targetGroupId:string, newChild:TagQueryNode ):TagQueryGroupNode {
  return addChildRec( tree, targetGroupId, newChild ) as TagQueryGroupNode ;
}

function addChildRec( node:TagQueryNode, targetGroupId:string, newChild:TagQueryNode ):TagQueryNode {
  if( node.type !== 'group' ) return node ;
  if( node.id === targetGroupId ) return { ...node, children: [ ...node.children, newChild ] } ;
  return { ...node, children: node.children.map( c => addChildRec( c, targetGroupId, newChild ) ) } ;
}

export function newConditionNode( tagId:number ):TagQueryConditionNode {
  return { id: uid(), type:'condition', tagId, negate:false } ;
}

export function newGroupNode():TagQueryGroupNode {
  return { id: uid(), type:'group', op:'AND', negated:false, collapsed:false, children:[] } ;
}

// AND -> OR -> NOT(AND) -> AND, matching the query-builder-panel's op badge
// cycle. Only meaningful on group nodes.
export function cycleOp( n:TagQueryGroupNode ):TagQueryGroupNode {
  if( n.op === 'AND' && !n.negated ) return { ...n, op:'OR', negated:false } ;
  if( n.op === 'OR' && !n.negated ) return { ...n, op:'AND', negated:true } ;
  return { ...n, op:'AND', negated:false } ;
}

// Every group (including root) needs at least one child for the query to be
// well-formed — mirrors the "needs at least 1 condition in this group"
// inline warning shown per invalid group.
export function validateTree( node:TagQueryNode ):boolean {
  if( node.type !== 'group' ) return true ;
  if( node.children.length < 1 ) return false ;
  return node.children.every( validateTree ) ;
}

// Inverse of TagQueryApiService's stripCollapsed() — a saved query comes
// back from the server in wire form (no 'collapsed'); this adds it back
// (always expanded) so the tree can be assigned straight into the editable
// UI tree.
export function hydrateTree( node:TagQueryNodeWire ):TagQueryNode {
  if( node.type === 'condition' ) return node ;
  return { ...node, collapsed:false, children: node.children.map( hydrateTree ) } ;
}

// Collects every leaf condition's tagId in the tree — used to figure out
// which tags need their names resolved (via TagApiService.getTag) after
// loading a saved query, since the tree only carries tagIds.
export function collectTagIds( node:TagQueryNode, into:Set<number> ) {
  if( node.type === 'condition' ) { into.add( node.tagId ) ; return ; }
  node.children.forEach( c => collectTagIds( c, into ) ) ;
}
