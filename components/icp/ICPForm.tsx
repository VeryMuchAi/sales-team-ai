'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import type { ICP } from '@/lib/types';

interface ICPFormProps {
  icp?: ICP;
}

export function ICPForm({ icp }: ICPFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(icp?.name || '');
  const [description, setDescription] = useState(icp?.description || '');
  const [industry, setIndustry] = useState(icp?.industry?.join(', ') || '');
  const [companySizeMin, setCompanySizeMin] = useState(icp?.company_size_min?.toString() || '');
  const [companySizeMax, setCompanySizeMax] = useState(icp?.company_size_max?.toString() || '');
  const [revenueMin, setRevenueMin] = useState(icp?.revenue_min?.toString() || '');
  const [revenueMax, setRevenueMax] = useState(icp?.revenue_max?.toString() || '');
  const [jobTitles, setJobTitles] = useState(icp?.job_titles?.join(', ') || '');
  const [locations, setLocations] = useState(icp?.locations?.join(', ') || '');
  const [technologies, setTechnologies] = useState(icp?.technologies?.join(', ') || '');
  const [keywords, setKeywords] = useState(icp?.keywords?.join(', ') || '');

  function parseList(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      description: description || null,
      industry: parseList(industry),
      company_size_min: companySizeMin ? parseInt(companySizeMin) : null,
      company_size_max: companySizeMax ? parseInt(companySizeMax) : null,
      revenue_min: revenueMin ? parseFloat(revenueMin) : null,
      revenue_max: revenueMax ? parseFloat(revenueMax) : null,
      job_titles: parseList(jobTitles),
      locations: parseList(locations),
      technologies: parseList(technologies),
      keywords: parseList(keywords),
    };

    const url = icp ? `/api/icp/${icp.id}` : '/api/icp';
    const method = icp ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || 'Failed to save ICP');
      setLoading(false);
      return;
    }

    toast.success(icp ? 'ICP updated' : 'ICP created');
    router.push('/dashboard/icp');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{icp ? 'Edit ICP' : 'Create ICP'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Enterprise SaaS Companies"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your ideal customer..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industries (comma-separated)</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="SaaS, Fintech, Healthcare"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companySizeMin">Company Size (min)</Label>
              <Input
                id="companySizeMin"
                type="number"
                value={companySizeMin}
                onChange={(e) => setCompanySizeMin(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySizeMax">Company Size (max)</Label>
              <Input
                id="companySizeMax"
                type="number"
                value={companySizeMax}
                onChange={(e) => setCompanySizeMax(e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="revenueMin">Revenue Min ($)</Label>
              <Input
                id="revenueMin"
                type="number"
                value={revenueMin}
                onChange={(e) => setRevenueMin(e.target.value)}
                placeholder="1000000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueMax">Revenue Max ($)</Label>
              <Input
                id="revenueMax"
                type="number"
                value={revenueMax}
                onChange={(e) => setRevenueMax(e.target.value)}
                placeholder="50000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitles">Target Job Titles (comma-separated)</Label>
            <Input
              id="jobTitles"
              value={jobTitles}
              onChange={(e) => setJobTitles(e.target.value)}
              placeholder="CTO, VP Engineering, Head of AI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locations">Locations (comma-separated)</Label>
            <Input
              id="locations"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
              placeholder="San Francisco, New York, London"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technologies">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="Python, AWS, Kubernetes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="AI, machine learning, automation"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : icp ? 'Update ICP' : 'Create ICP'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/icp')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
