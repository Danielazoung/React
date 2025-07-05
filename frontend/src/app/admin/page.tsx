'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';

interface EmpruntAttente {
  id: number;
  livre_titre?: string;
  livre_id: number;
  user_prenom?: string;
  user_nom?: string;
  user_id: number;
  date_emprunt: string;
}

interface DashboardStats {
  totalLivres: number;
  totalUtilisateurs: number;
  empruntsEnCours: number;
  retoursCeMois: number;
  utilisateursActifs: number;
  retardsEnCours: number;
  livresPopulaires: Array<{
    id: number;
    titre: string;
    auteur: string;
    nombreEmprunts: number;
  }>;
  empruntsParMois: Array<{
    mois: string;
    nombre: number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [empruntsEnAttente, setEmpruntsEnAttente] = useState<EmpruntAttente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validatingId, setValidatingId] = useState<number | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Charger les stats et les emprunts en attente
        const [statsResponse, empruntsResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/emprunts/admin/en-attente')
        ]);
        
        setStats(statsResponse.data);
        setEmpruntsEnAttente(empruntsResponse.data);
      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleApprouver = async (id: number) => {
    setValidatingId(id);
    try {
      await api.post(`/emprunts/admin/approuver/${id}`);
      // Recharger les données
      const [statsResponse, empruntsResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/emprunts/admin/en-attente')
      ]);
      setStats(statsResponse.data);
      setEmpruntsEnAttente(empruntsResponse.data);
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err);
      setError('Erreur lors de l\'approbation');
    } finally {
      setValidatingId(null);
    }
  };

  const handleRejeter = async (id: number) => {
    setValidatingId(id);
    try {
      await api.post(`/emprunts/admin/rejeter/${id}`);
      // Recharger les données
      const [statsResponse, empruntsResponse] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/emprunts/admin/en-attente')
      ]);
      setStats(statsResponse.data);
      setEmpruntsEnAttente(empruntsResponse.data);
    } catch (err) {
      console.error('Erreur lors du rejet:', err);
      setError('Erreur lors du rejet');
    } finally {
      setValidatingId(null);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Tableau de bord Admin</h1>
          {loading ? (
            <div>Chargement...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalUtilisateurs}</div>
                  <div className="text-gray-600">Utilisateurs</div>
                </div>
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalLivres}</div>
                  <div className="text-gray-600">Livres</div>
                </div>
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.empruntsEnCours}</div>
                  <div className="text-gray-600">Emprunts en cours</div>
                </div>
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-purple-600">{empruntsEnAttente.length}</div>
                  <div className="text-gray-600">En attente</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-teal-600">{stats.retoursCeMois}</div>
                  <div className="text-gray-600">Retours ce mois</div>
                </div>
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{stats.utilisateursActifs}</div>
                  <div className="text-gray-600">Utilisateurs actifs</div>
                </div>
                <div className="bg-white rounded shadow p-6 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.retardsEnCours}</div>
                  <div className="text-gray-600">Retards en cours</div>
                </div>
              </div>
              <div className="bg-white rounded shadow p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Emprunts en attente de validation</h2>
                {empruntsEnAttente.length === 0 ? (
                  <div className="text-gray-500">Aucun emprunt en attente</div>
                ) : (
                  <div className="space-y-3">
                    {empruntsEnAttente.map((emprunt) => (
                      <div key={emprunt.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <span className="font-medium">{emprunt.livre_titre || `Livre #${emprunt.livre_id}`}</span>
                          <span className="ml-2 text-gray-600 text-sm">par {emprunt.user_prenom} {emprunt.user_nom} (ID: {emprunt.user_id})</span>
                          <span className="ml-2 text-xs text-gray-500">{new Date(emprunt.date_emprunt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                            disabled={validatingId === emprunt.id}
                            onClick={() => handleApprouver(emprunt.id)}
                          >
                            {validatingId === emprunt.id ? 'Validation...' : 'Approuver'}
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            disabled={validatingId === emprunt.id}
                            onClick={() => handleRejeter(emprunt.id)}
                          >
                            Rejeter
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Livres populaires */}
              <div className="bg-white rounded shadow p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Livres les plus empruntés</h2>
                {stats.livresPopulaires.length === 0 ? (
                  <div className="text-gray-500">Aucune donnée disponible</div>
                ) : (
                  <div className="space-y-2">
                    {stats.livresPopulaires.map((livre, index) => (
                      <div key={livre.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <span className="font-medium">{index + 1}. {livre.titre}</span>
                          <span className="text-gray-600 text-sm ml-2">par {livre.auteur}</span>
                        </div>
                        <div className="text-blue-600 font-semibold">{livre.nombreEmprunts} emprunts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Statistiques par mois */}
              <div className="bg-white rounded shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Emprunts par mois</h2>
                {stats.empruntsParMois.length === 0 ? (
                  <div className="text-gray-500">Aucune donnée disponible</div>
                ) : (
                  <div className="flex space-x-4">
                    {stats.empruntsParMois.map((stat) => (
                      <div key={stat.mois} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stat.nombre}</div>
                        <div className="text-gray-600 text-sm">{stat.mois}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
