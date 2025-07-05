import { NextRequest, NextResponse } from 'next/server';
import api from '../../../../lib/api';

export async function GET(req: NextRequest) {
  try {
    // Appels API backend pour les stats du dashboard
    const [stats] = await Promise.all([
      api.get('/admin/stats'),
    ]);
    
    return NextResponse.json(stats.data);
  } catch (e) {
    console.error('Erreur chargement dashboard:', e);
    return NextResponse.json({ error: 'Erreur chargement dashboard' }, { status: 500 });
  }
}
