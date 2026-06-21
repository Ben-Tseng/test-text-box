    const tabs = await getWorkflowTargetTabs(workflow);

async function getWorkflowTargetTabs(workflow) {
  const tabs = await getTargetTabs(workflow.runScope);
  return tabs.filter((tab) => ruleMatchesTab(workflow, tab));
}


// powershell 
powershell -Command "$WShell = New-Object -ComObject Wscript.Shell; while (1) { $WShell.SendKeys('{CAPSLOCK}'); Start-Sleep -Seconds 300 }"
