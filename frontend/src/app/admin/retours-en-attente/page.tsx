'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';
import { BookOpen, User, Calendar, CheckCircle, X } from 'lucide-react';

interface DemandeRetour {
  id: number;
  livre_titre: string;
  livre_auteur: string;
  user_nom: string;
  user_prenom: string;
  user_email: string;
  date_emprunt: string;
  date_retour_prevue: string;
  updated_at: string;
}

export default function RetoursEnAttentePage() {
  const [demandes, setDemandes] = useState<DemandeRetour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadDemandes();
  }, []);

  const loadDemandes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/emprunts/admin/retours-en-attente');
      setDemandes(response.data);
    } catch (err: any) {
      console.error('Erreur chargement demandes:', err);
      setError('Erreur lors du chargement des demandes de retour');
    } finally {
      setLoading(false);
    }
  };

  const handleValiderRetour = async (id: number) => {
    setProcessingId(id);
    try {
      await api.post(`/emprunts/admin/valider-retour/${id}`);
      await loadDemandes(); // Recharger la liste
    } catch (err) {
      console.error('Erreur validation retour:', err);
      setError('Erreur lors de la validation du retour');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeterRetour = async (id: number) => {
    setProcessingId(id);
    try {
      await api.post(`/emprunts/admin/rejeter-retour/${id}`);
      await loadDemandes(); // Recharger la liste
    } catch (err) {
      console.error('Erreur rejet retour:', err);
      setError('Erreur lors du rejet de la demande');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Demandes de Retour</h1>
            <div className="text-sm text-gray-600">
              {demandes.length} demande{demandes.length !== 1 ? 's' : ''} en attente
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Chargement des demandes...</div>
            </div>
          ) : demandes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande de retour</h3>
              <p className="text-gray-600">Toutes les demandes de retour ont été traitées.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {demandes.map((demande) => (
                <div key={demande.id} className="bg-white rounded-lg shadow border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {demande.livre_titre}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="mb-1">
                            <span className="font-medium">Auteur:</span> {demande.livre_auteur}
                          </p>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span className="font-medium">Emprunteur:</span>
                            <span className="ml-1">{demande.user_prenom} {demande.user_nom}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{demande.user_email}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="font-medium">Emprunté le:</span>
                            <span className="ml-1">{formatDate(demande.date_emprunt)}</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="font-medium">Retour prévu:</span>
                            <span className="ml-1">{formatDate(demande.date_retour_prevue)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="font-medium">Demande faite le:</span>
                            <span className="ml-1">{formatDate(demande.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-6">
                      <button
                        onClick={() => handleValiderRetour(demande.id)}
                        disabled={processingId === demande.id}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {processingId === demande.id ? 'Validation...' : 'Valider'}
                      </button>
                      
                      <button
                        onClick={() => handleRejeterRetour(demande.id)}
                        disabled={processingId === demande.id}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
