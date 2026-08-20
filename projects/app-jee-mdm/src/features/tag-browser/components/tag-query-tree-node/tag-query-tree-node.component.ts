import { Component, inject, input } from '@angular/core';
import { TagQueryConditionNode, TagQueryGroupNode, TagQueryNode } from "@jee-common/util/tag-query-types";
import { TagBrowserService } from "../../tag-browser.service";

// Recursive node in the AND/OR/NOT tag-query tree — one instance renders
// itself again for every child group, so the whole tree is just nested
// instances of this component. Talks straight to TagBrowserService (the
// route-scoped store) rather than piping every action back up through
// outputs — matches question-browser's sub-pane convention of injecting the
// route service directly.
@Component({
  selector: 'tag-query-tree-node',
  imports: [ TagQueryTreeNodeComponent ],
  templateUrl: './tag-query-tree-node.component.html',
  styleUrl: './tag-query-tree-node.component.css'
})
export class TagQueryTreeNodeComponent {

  protected svc = inject( TagBrowserService ) ;

  node = input.required<TagQueryNode>() ;

  asCondition():TagQueryConditionNode {
    return this.node() as TagQueryConditionNode ;
  }

  asGroup():TagQueryGroupNode {
    return this.node() as TagQueryGroupNode ;
  }

  isInvalidGroup():boolean {
    return this.asGroup().children.length < 1 ;
  }

  opLabel():string {
    const g = this.asGroup() ;
    return g.negated ? 'NOT' : g.op ;
  }
}
