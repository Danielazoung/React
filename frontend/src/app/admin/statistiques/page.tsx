'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

interface Stats {
  totalLivres: number;
  totalUtilisateurs: number;
  empruntsEnCours: number;
  retoursCeMois: number;
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
  utilisateursActifs: number;
  retardsEnCours: number;
}

export default function AdminStatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mois');

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    try {
      const response = await api.get(`/admin/stats?period=${selectedPeriod}`);
      setStats(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // Données factices pour la démonstration
  const mockStats: Stats = {
    totalLivres: 1247,
    totalUtilisateurs: 342,
    empruntsEnCours: 89,
    retoursCeMois: 156,
    utilisateursActifs: 234,
    retardsEnCours: 12,
    livresPopulaires: [
      { id: 1, titre: "Clean Code", auteur: "Robert C. Martin", nombreEmprunts: 45 },
      { id: 2, titre: "Le Petit Prince", auteur: "Antoine de Saint-Exupéry", nombreEmprunts: 38 },
      { id: 3, titre: "1984", auteur: "George Orwell", nombreEmprunts: 32 },
      { id: 4, titre: "Sapiens", auteur: "Yuval Noah Harari", nombreEmprunts: 28 },
      { id: 5, titre: "Introduction aux Algorithmes", auteur: "Thomas H. Cormen", nombreEmprunts: 24 }
    ],
    empruntsParMois: [
      { mois: "Jan", nombre: 120 },
      { mois: "Fév", nombre: 98 },
      { mois: "Mar", nombre: 156 },
      { mois: "Avr", nombre: 134 },
      { mois: "Mai", nombre: 178 },
      { mois: "Juin", nombre: 145 }
    ]
  };

  const currentStats = stats || mockStats;

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
              <p className="mt-2 text-gray-600">Analyse des données d'utilisation de la bibliothèque</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
              </select>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Livres</p>
                  <p className="text-2xl font-bold text-gray-900">{currentStats.totalLivres.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% ce mois
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{currentStats.utilisateursActifs}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% ce mois
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Emprunts en cours</p>
                  <p className="text-2xl font-bold text-gray-900">{currentStats.empruntsEnCours}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentStats.retardsEnCours} en retard
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Retours ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">{currentStats.retoursCeMois}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% vs mois dernier
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Chart des emprunts par mois */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Emprunts par mois</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {currentStats.empruntsParMois.map((data, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-12 text-sm font-medium text-gray-600">{data.mois}</div>
                    <div className="flex-1 ml-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(data.nombre / 200) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-gray-900">{data.nombre}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Livres populaires */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Livres les plus empruntés</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {currentStats.livresPopulaires.map((livre, index) => (
                  <div key={livre.id} className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{livre.titre}</p>
                      <p className="text-xs text-gray-500">{livre.auteur}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {livre.nombreEmprunts} emprunts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alertes et notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Retards</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">{currentStats.retardsEnCours}</p>
              <p className="text-sm text-gray-600 mt-1">Emprunts en retard</p>
              <button className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium">
                Voir les détails →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">À retourner bientôt</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-600">23</p>
              <p className="text-sm text-gray-600 mt-1">Dans les 3 prochains jours</p>
              <button className="mt-3 text-sm text-yellow-600 hover:text-yellow-800 font-medium">
                Envoyer des rappels →
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Stock faible</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">8</p>
              <p className="text-sm text-gray-600 mt-1">Livres avec moins de 2 exemplaires</p>
              <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                Voir la liste →
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
