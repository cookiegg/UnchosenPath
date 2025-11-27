import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GameTree, HistoryNode } from '../types';

interface HistoryTreeProps {
  gameTree: GameTree;
  onNodeClick: (nodeId: string) => void;
  currentNodeId: string | null;
}

// 自定义节点组件
const CustomNode = ({ data }: { data: any }) => {
  const isCurrent = data.isCurrent;
  const hasBranches = data.branchCount > 0;
  const isRoot = data.isRoot;
  const isCollapsed = data.isCollapsed;
  const onToggleCollapse = data.onToggleCollapse;

  return (
    <div
      className={`relative group transition-all duration-300 ${isCurrent ? 'scale-105 z-10' : 'hover:scale-105 hover:z-10'
        }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />

      <div
        className={`
          w-[260px] rounded-xl overflow-hidden border-2 shadow-lg backdrop-blur-sm
          ${isCurrent
            ? 'bg-academic-900/90 border-amber-500 shadow-amber-500/20'
            : 'bg-academic-800/90 border-academic-600 hover:border-academic-400 hover:shadow-academic-500/10'
          }
        `}
      >
        {/* Header */}
        <div
          className={`
            px-3 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center
            ${isCurrent
              ? 'bg-amber-600 text-white'
              : 'bg-academic-950/50 text-academic-300'
            }
          `}
        >
          <span className="truncate max-w-[180px]">{data.phase}</span>
          {data.branchCount > 1 && (
            <span className="bg-academic-900/50 px-1.5 py-0.5 rounded text-[10px]">
              {data.branchCount} 分支
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-3">
          <div className={`text-sm font-medium mb-1 line-clamp-2 ${isCurrent ? 'text-white' : 'text-academic-100'}`}>
            {data.choiceText}
          </div>
          {data.description && (
            <div className="text-xs text-academic-400 line-clamp-2 mt-2 pt-2 border-t border-academic-700/50">
              {data.description}
            </div>
          )}
        </div>

        {/* Footer/Status */}
        {isRoot && (
          <div className="px-3 py-1 bg-blue-900/30 text-blue-300 text-[10px] text-center font-mono">
            START
          </div>
        )}
        {isCurrent && (
          <div className="px-3 py-1 bg-amber-900/30 text-amber-300 text-[10px] text-center font-mono animate-pulse">
            CURRENT
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {hasBranches && (
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(data.id);
          }}
        >
          <div className={`
            w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors
            ${isCollapsed
              ? 'bg-amber-600 border-amber-400 text-white hover:bg-amber-500'
              : 'bg-academic-800 border-academic-500 text-academic-300 hover:bg-academic-700 hover:text-white'
            }
          `}>
            {isCollapsed ? '+' : '-'}
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const HistoryTree: React.FC<HistoryTreeProps> = ({
  gameTree,
  onNodeClick,
  currentNodeId,
}) => {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const handleToggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // 将 GameTree 转换为 ReactFlow 的 nodes 和 edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!gameTree.rootId) {
      return { initialNodes: nodes, initialEdges: edges };
    }

    // 1. 确定可见节点
    const visibleNodes = new Set<string>();
    const queue = [gameTree.rootId];

    while (queue.length > 0) {
      const id = queue.shift()!;
      visibleNodes.add(id);

      // 如果当前节点未折叠，则将其子节点加入队列
      if (!collapsedNodes.has(id)) {
        const node = gameTree.nodes[id];
        if (node) {
          node.children.forEach(childId => queue.push(childId));
        }
      }
    }

    // 2. 布局计算 (仅针对可见节点)
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const nodeWidth = 320; // 增加宽度以适应水平布局和间距
    const nodeHeight = 200; // 垂直间距

    // 自底向上计算子树高度 (水平布局中，高度对应垂直方向)
    const subtreeHeights: Record<string, number> = {};

    const calculateSubtreeHeight = (nodeId: string): number => {
      const node = gameTree.nodes[nodeId];
      if (!node || !visibleNodes.has(nodeId) || node.children.length === 0 || collapsedNodes.has(nodeId)) {
        subtreeHeights[nodeId] = nodeHeight;
        return nodeHeight;
      }

      let height = 0;
      let visibleChildrenCount = 0;
      node.children.forEach(childId => {
        if (visibleNodes.has(childId)) {
          height += calculateSubtreeHeight(childId);
          visibleChildrenCount++;
        }
      });

      // 增加一些间距
      if (visibleChildrenCount > 1) {
        height += (visibleChildrenCount - 1) * 40; // Vertical spacing between children
      }

      subtreeHeights[nodeId] = Math.max(height, nodeHeight);
      return subtreeHeights[nodeId];
    };

    if (gameTree.rootId) {
      calculateSubtreeHeight(gameTree.rootId);
    }

    // 自顶向下分配位置 (水平布局：x 随深度增加，y 根据子树高度分配)
    const assignPositions = (nodeId: string, x: number, y: number) => {
      const node = gameTree.nodes[nodeId];
      if (!node || !visibleNodes.has(nodeId)) return;

      nodePositions[nodeId] = { x, y };

      // 如果折叠了，就不处理子节点位置
      if (collapsedNodes.has(nodeId)) return;

      const children = node.children.filter(childId => visibleNodes.has(childId));
      if (children.length === 0) return;

      let currentY = y - subtreeHeights[nodeId] / 2;

      children.forEach(childId => {
        const childHeight = subtreeHeights[childId];
        const childY = currentY + childHeight / 2;
        assignPositions(childId, x + nodeWidth, childY);
        currentY += childHeight + 40; // Vertical spacing
      });
    };

    if (gameTree.rootId) {
      assignPositions(gameTree.rootId, 0, 0);
    }

    // 创建 ReactFlow nodes
    (Object.values(gameTree.nodes) as HistoryNode[]).forEach((node) => {
      if (!visibleNodes.has(node.id)) return;

      const pos = nodePositions[node.id] || { x: 0, y: 0 };
      nodes.push({
        id: node.id,
        type: 'custom',
        position: pos,
        draggable: false, // 禁止拖动
        data: {
          id: node.id, // 传递 ID 用于回调
          phase: node.phase,
          choiceText: node.choiceText,
          description: node.description,
          isCurrent: node.id === currentNodeId,
          branchCount: node.children.length,
          isRoot: node.id === gameTree.rootId,
          isCollapsed: collapsedNodes.has(node.id),
          onToggleCollapse: handleToggleCollapse,
        },
      });

      // 创建边 (仅当子节点可见时)
      if (!collapsedNodes.has(node.id)) {
        node.children.forEach((childId: string) => {
          if (visibleNodes.has(childId)) {
            edges.push({
              id: `${node.id}-${childId}`,
              source: node.id,
              target: childId,
              type: 'smoothstep', // 使用 smoothstep 或 bezier
              animated: childId === currentNodeId,
              style: {
                stroke: childId === currentNodeId ? '#d97706' : '#4b5563',
                strokeWidth: childId === currentNodeId ? 3 : 1.5,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: childId === currentNodeId ? '#d97706' : '#4b5563',
              },
            });
          }
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [gameTree, currentNodeId, collapsedNodes, handleToggleCollapse]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 更新节点当 gameTree 或 collapsedNodes 变化时
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick(node.id);
    },
    [onNodeClick]
  );

  if (!gameTree.rootId) {
    return (
      <div className="h-full flex items-center justify-center text-academic-500 flex-col gap-4">
        <div className="text-4xl opacity-20">🌳</div>
        <div>暂无历史记录</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-academic-950/50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false} // 全局禁止拖动
      >
        <Background color="#374151" gap={24} size={1} />
        <Controls
          className="!bg-academic-800 !border-academic-600 !rounded-lg !shadow-xl"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
};

export default HistoryTree;
