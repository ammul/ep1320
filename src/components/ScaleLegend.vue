<template>
  <div class="legend">
    <span class="legend-item root">root</span>
    <span class="legend-sep">·</span>
    <span class="legend-item anchor">anchor — land here</span>
    <span class="legend-sep">·</span>
    <span class="legend-item safe">safe</span>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.legend-sep {
  color: var(--text5);
  font-size: 0.75rem;
}

.legend-item {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text3);
  letter-spacing: 0.03em;
}

.legend-item::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.3rem;
  vertical-align: middle;
}

.legend-item.root::before   { background: var(--rust); }
.legend-item.anchor::before { background: var(--accent-mid); }
.legend-item.safe::before   { background: var(--border2); }

@media (orientation: landscape) and (max-height: 500px) {
  .legend {
    margin-top: 0.5rem;
  }
}
</style>
