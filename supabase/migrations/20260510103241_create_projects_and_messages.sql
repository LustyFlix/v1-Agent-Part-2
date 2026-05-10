/*
  # Create Projects and Messages Tables

  ## Summary
  Sets up the core data model for the bolt.new v1 Legacy Agent clone.

  ## New Tables

  ### `projects`
  Stores AI coding projects created by users.
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users - nullable for anonymous use initially)
  - `name` (text) - project display name
  - `description` (text) - short description
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `messages`
  Stores chat messages (user and assistant) per project.
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key to projects)
  - `role` (text) - 'user' or 'assistant'
  - `content` (text) - raw message content
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on both tables
  - Policies scoped to authenticated users owning the project
  - Anonymous (unauthenticated) users cannot access data
*/

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Project',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own projects"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in own projects"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in own projects"
  ON messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS messages_project_id_idx ON messages(project_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
