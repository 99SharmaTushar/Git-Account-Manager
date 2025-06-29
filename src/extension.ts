import * as vscode from 'vscode';
import { GitProfileProvider } from './treeView';
import { switchGitProfile, addGitProfile, deleteGitProfile } from './commands';
import { getCurrentProfile, GitProfile } from './profileManager'; // <- Make sure this is exported

let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  const provider = new GitProfileProvider();
  vscode.window.registerTreeDataProvider('gitProfiles', provider);

  // Create and show status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  context.subscriptions.push(statusBarItem);

  const updateStatusBar = async () => {
    const current = await getCurrentProfile();
    if (current) {
      statusBarItem.text = `$(verified) ${current.label}`;
      statusBarItem.tooltip = `Git: ${current.name} <${current.email}>`;
    } else {
      statusBarItem.text = `$(account) No Active Git profile`;
      statusBarItem.tooltip = 'No Git profile selected';
    }
    statusBarItem.command = 'gitProfileSwitcher.switchProfile';
    statusBarItem.show();
  };

  function extractProfile(obj: any): GitProfile {
    return obj?.profileData || obj;
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('gitProfileSwitcher.refresh', () => {
      provider.refresh();
      updateStatusBar();
    }),
    vscode.commands.registerCommand('gitProfileSwitcher.switchProfile', async (profile) => {
      const extracted = extractProfile(profile);
      await switchGitProfile(extracted, provider);
      updateStatusBar();
    }),
    vscode.commands.registerCommand('gitProfileSwitcher.addProfile', async () => {
      await addGitProfile(provider);
      updateStatusBar();
    }),
    vscode.commands.registerCommand('gitProfileSwitcher.deleteProfile', async (profile) => {
      const extracted = extractProfile(profile);
      await deleteGitProfile(provider, extracted, updateStatusBar);
      updateStatusBar();
    })
  );

  updateStatusBar();
}

export function deactivate() {}
