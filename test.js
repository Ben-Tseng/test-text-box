    const tabs = await getWorkflowTargetTabs(workflow);

async function getWorkflowTargetTabs(workflow) {
  const tabs = await getTargetTabs(workflow.runScope);
  return tabs.filter((tab) => ruleMatchesTab(workflow, tab));
}
