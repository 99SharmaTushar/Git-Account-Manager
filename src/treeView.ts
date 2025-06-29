import * as vscode from 'vscode';
import * as path from 'path';
import { getProfiles, setCurrentProfile, getCurrentProfile } from './profileManager';

export class GitProfileProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const profiles = await getProfiles();
    const current = await getCurrentProfile();

    const items = profiles.map((p) => {
      const labelPrefix = p.label === current?.label ? '' : '';
      const item = new vscode.TreeItem(`${labelPrefix}${p.label} (${p.name})`, vscode.TreeItemCollapsibleState.None);
      item.contextValue = 'profile';
      item.command = {
        command: 'gitProfileSwitcher.switchProfile',
        title: 'Switch Git Profile',
        arguments: [p],
      };
      item.iconPath = new vscode.ThemeIcon(
        p.label === current?.label ? 'check' : 'account',
        p.label === current?.label ? new vscode.ThemeColor('charts.green') : undefined
      );
      (item as any).profileData = p;
      return item;
    });

    items.push(new vscode.TreeItem('➕ Add New Profile', vscode.TreeItemCollapsibleState.None));
    items[items.length - 1].command = {
      command: 'gitProfileSwitcher.addProfile',
      title: 'Add New Profile',
    };

    return items;
  }
}